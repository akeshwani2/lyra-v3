import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(
    request: Request,
    { params }: { params: { boardId: string } } & { searchParams: { [key: string]: string | string[] | undefined } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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