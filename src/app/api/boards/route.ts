import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

async function getOrCreateBoard(userId: string) {
    // First try to find an existing board for this user
    let board = await prisma.board.findFirst({
        where: { userId },
        include: { 
            columns: {
                include: {
                    cards: {
                        orderBy: {
                            order: 'asc'
                        }
                    }
                },
                orderBy: {
                    order: 'asc'
                }
            }
        }
    });

    // If no board exists or if it has no columns, create a new one with columns
    if (!board || board.columns.length === 0) {
        // Use transaction to ensure atomicity
        board = await prisma.$transaction(async (tx) => {
            // Create the board
            const newBoard = await tx.board.create({
                data: {
                    title: "My Tasks",
                    userId,
                }
            });

            // Create default columns
            await tx.column.createMany({
                data: [
                    { title: 'Todo', order: 0, boardId: newBoard.id },
                    { title: 'In Progress', order: 1, boardId: newBoard.id },
                    { title: 'Completed', order: 2, boardId: newBoard.id }
                ]
            });

            // Return the complete board with columns
            return await tx.board.findFirst({
                where: { id: newBoard.id },
                include: {
                    columns: {
                        include: {
                            cards: {
                                orderBy: {
                                    order: 'asc'
                                }
                            }
                        },
                        orderBy: {
                            order: 'asc'
                        }
                    }
                }
            });
        });
    }

    return board;
}

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const board = await getOrCreateBoard(userId);
        return NextResponse.json(board);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ 
            error: "Error fetching/creating board",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title } = await request.json();

        // Use the same getOrCreateBoard function to ensure consistency
        const board = await getOrCreateBoard(userId);
        
        // Update the board title if provided
        if (title) {
            await prisma.board.update({
                where: { id: board?.id },
                data: { title }
            });
        }

        return NextResponse.json(board);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ 
            error: "Error creating board",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}