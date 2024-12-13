import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: Request) {
    const boardId = request.url.split('/').pop();
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const board = await prisma.board.findFirst({
            where: {
                id: boardId,
                userId
            },
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

        if (!board) {
            return NextResponse.json({ error: "Board not found" }, { status: 404 });
        }

        return NextResponse.json(board.columns);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error fetching columns" }, { status: 500 });
    }
}