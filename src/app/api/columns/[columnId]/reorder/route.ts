import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function PATCH(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const columnId = request.url.split('/columns/')[1].split('/')[0];
        const { sourceIndex, targetIndex } = await request.json();

        const sourceColumn = await prisma.column.findUnique({
            where: { id: columnId },
            select: { boardId: true }
        });

        if (!sourceColumn) {
            return NextResponse.json({ error: 'Source column not found' }, { status: 404 });
        }

        const columns = await prisma.column.findMany({
            where: { boardId: sourceColumn.boardId },
            orderBy: { order: 'asc' }
        });

        const updates = [];

        if (sourceIndex < targetIndex) {
            updates.push(
                ...columns
                    .filter(col => col.order > sourceIndex && col.order <= targetIndex)
                    .map(col => 
                        prisma.column.update({
                            where: { id: col.id },
                            data: { order: col.order - 1 }
                        })
                    )
            );
        } else {
            updates.push(
                ...columns
                    .filter(col => col.order >= targetIndex && col.order < sourceIndex)
                    .map(col => 
                        prisma.column.update({
                            where: { id: col.id },
                            data: { order: col.order + 1 }
                        })
                    )
            );
        }

        updates.push(
            prisma.column.update({
                where: { id: columnId },
                data: { order: targetIndex }
            })
        );

        await prisma.$transaction(updates);

        const updatedColumns = await prisma.column.findMany({
            where: { boardId: sourceColumn.boardId },
            orderBy: { order: 'asc' },
            include: {
                cards: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        return NextResponse.json(updatedColumns);

    } catch (error) {
        console.error('Error reordering column:', error);
        return NextResponse.json({ error: 'Failed to reorder column' }, { status: 500 });
    }
}