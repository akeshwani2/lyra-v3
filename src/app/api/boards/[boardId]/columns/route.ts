import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(
    request: Request,
    { params }: { params: { boardId: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Add check for board ownership and include columns
        const board = await prisma.board.findFirst({
            where: {
                id: params.boardId,
                userId
            },
            include: {
                columns: true
            }
        });

        if (!board) {
            return NextResponse.json({ error: "Board not found" }, { status: 404 });
        }

        const columns = await prisma.column.findMany({
            where: {
                boardId: params.boardId
            },
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
        });

        return NextResponse.json(columns);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error fetching columns" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { boardId: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { columns } = await request.json();

        // Create all columns
        const createdColumns = await prisma.column.createMany({
            data: columns.map((col: { title: string; order: number }) => ({
                title: col.title,
                order: col.order,
                boardId: params.boardId
            }))
        });

        // Fetch and return the created columns
        const allColumns = await prisma.column.findMany({
            where: { boardId: params.boardId },
            include: { cards: true },
            orderBy: { order: 'asc' }
        });

        return NextResponse.json(allColumns);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error creating columns" }, { status: 500 });
    }
}