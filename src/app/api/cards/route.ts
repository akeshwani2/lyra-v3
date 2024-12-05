import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" }, 
                { status: 401 }
            );
        }

        // Get data from request
        const { columnId, content } = await request.json();

        // Get current column to check card count
        const column = await prisma.column.findUnique({
            where: { id: columnId },
            include: { cards: true }
        });

        if (!column) {
            return NextResponse.json(
                { error: "Column not found" },
                { status: 404 }
            );
        }

        // Create new card at the end of the column
        await prisma.card.create({
            data: {
                content: content || "New Task",
                columnId,
                order: column.cards.length
            }
        });

        // Get the updated column with all cards
        const updatedColumn = await prisma.column.findUnique({
            where: { id: columnId },
            include: {
                cards: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });

        return NextResponse.json(updatedColumn);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Error creating card" },
            { status: 500 }
        );
    }
}