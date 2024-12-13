import { prisma } from '@/app/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(
    request: NextRequest
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extract boardId from URL
        const url = new URL(request.url);
        const boardId = url.pathname.split('/').reverse()[1];

        // Add check for board ownership and include columns
        const board = await prisma.board.findFirst({
            where: {
                id: boardId,
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
                boardId: boardId
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
    request: NextRequest
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extract boardId from URL
        const url = new URL(request.url);
        const boardId = url.pathname.split('/').reverse()[1];

        const { columns } = await request.json();

        // Create all columns
        const createdColumns = await prisma.column.createMany({
            data: columns.map((col: { title: string; order: number }) => ({
                title: col.title,
                order: col.order,
                boardId: boardId
            }))
        });

        // Fetch and return the created columns
        const allColumns = await prisma.column.findMany({
            where: { boardId: boardId },
            include: { cards: true },
            orderBy: { order: 'asc' }
        });

        return NextResponse.json(allColumns);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error creating columns" }, { status: 500 });
    }
}