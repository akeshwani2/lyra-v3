import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function PATCH(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extract cardId from URL
        const url = new URL(request.url);
        const cardId = url.pathname.split('/').pop() || '';

        const { columnId, targetCardId, position, content } = await request.json();

        // First get the current card to verify ownership
        const currentCard = await prisma.card.findUnique({
            where: { id: cardId },
            include: {
                column: {
                    include: {
                        board: true
                    }
                }
            }
        });

        if (!currentCard || currentCard.column.board.userId !== userId) {
            return NextResponse.json({ error: "Card not found" }, { status: 404 });
        }

        // Find the target column within the same board
        const column = await prisma.column.findFirst({
            where: { 
                title: columnId,
                boardId: currentCard.column.boardId // Ensure we're using a column from the same board
            },
            include: { 
                cards: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });

        if (!column) {
            return NextResponse.json({ error: "Column not found" }, { status: 404 });
        }

        let newOrder = 0;
        if (targetCardId) {
            const targetCard = column.cards.find(card => card.id === targetCardId);
            if (targetCard) {
                newOrder = position === 'before' ? targetCard.order : targetCard.order + 1;
            }
        } else {
            newOrder = position === 'bottom' ? (column.cards.length > 0 ? column.cards[column.cards.length - 1].order + 1 : 0) : 0;
        }

        // Update the card
        const updatedCard = await prisma.card.update({
            where: { id: cardId },
            data: {
                columnId: column.id,
                order: newOrder,
                content: content?.trim() || undefined
            }
        });

        // Reorder other cards
        await prisma.card.updateMany({
            where: {
                columnId: column.id,
                NOT: { id: cardId },
                order: { gte: newOrder }
            },
            data: {
                order: { increment: 1 }
            }
        });

        return NextResponse.json(updatedCard);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ 
            error: "Error updating card",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extract cardId from URL
        const url = new URL(request.url);
        const cardId = url.pathname.split('/').pop() || '';

        await prisma.card.delete({
            where: { id: cardId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error deleting card" }, { status: 500 });
    }
}