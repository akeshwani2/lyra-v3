import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { columnTitle, content, boardId } = await request.json();

        // First verify board ownership
        const board = await prisma.board.findFirst({
            where: {
                id: boardId,
                userId
            }
        });

        if (!board) {
            return NextResponse.json({ error: "Board not found" }, { status: 404 });
        }

        // Find the column within this specific board
        const column = await prisma.column.findFirst({
            where: {
                boardId: board.id,
                title: columnTitle
            },
            include: {
                cards: {
                    orderBy: {
                        order: 'desc'
                    },
                    take: 1
                }
            }
        });

        if (!column) {
            return NextResponse.json({ error: "Column not found" }, { status: 404 });
        }

        // Calculate the highest order
        const highestOrder = column.cards[0]?.order ?? -1;

        // Create the card
        const card = await prisma.card.create({
            data: {
                content,
                order: highestOrder + 1,
                columnId: column.id
            }
        });

        return NextResponse.json(card);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ 
            error: "Error creating card",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}