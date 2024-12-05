import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function DELETE(
    request: Request
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get cardId from URL instead of params
        const cardId = request.url.split('/').pop();

        if (!cardId) {
            return NextResponse.json({ error: "Card ID not provided" }, { status: 400 });
        }
        
        await prisma.card.delete({
            where: { id: cardId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error deleting card" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get cardId from URL
        const cardId = request.url.split('/').pop();
        const { columnId, targetCardId, position, content } = await request.json();

        const columnCards = await prisma.card.findMany({
            where: { columnId },
            orderBy: { order: 'asc' }
        });

        let newOrder = 0;
        
        if (targetCardId) {
            const targetCard = columnCards.find(card => card.id === targetCardId);
            if (targetCard) {
                newOrder = position === 'top' ? targetCard.order - 1 : targetCard.order + 1;
            }
        } else {
            newOrder = position === 'top' ? 0 : columnCards.length;
        }

        const updatedCard = await prisma.card.update({
            where: { id: cardId },
            data: {
                columnId,
                order: newOrder,
                content: content?.trim() || undefined
            }
        });

        await prisma.card.updateMany({
            where: {
                columnId,
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
        return NextResponse.json({ error: "Error updating card" }, { status: 500 });
    }
}