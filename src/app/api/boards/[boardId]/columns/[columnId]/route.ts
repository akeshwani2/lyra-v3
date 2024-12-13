import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function PATCH(
    request: Request,
    { params }: { params: { columnId: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, order } = await request.json();

        // If changing order, update other columns' orders
        if (order !== undefined) {
            const currentColumn = await prisma.column.findUnique({
                where: { id: params.columnId }
            });

            if (currentColumn) {
                if (order > currentColumn.order) {
                    // Moving right
                    await prisma.column.updateMany({
                        where: {
                            order: {
                                gt: currentColumn.order,
                                lte: order
                            },
                            NOT: {
                                id: params.columnId
                            }
                        },
                        data: {
                            order: { decrement: 1 }
                        }
                    });
                } else {
                    // Moving left
                    await prisma.column.updateMany({
                        where: {
                            order: {
                                gte: order,
                                lt: currentColumn.order
                            },
                            NOT: {
                                id: params.columnId
                            }
                        },
                        data: {
                            order: { increment: 1 }
                        }
                    });
                }
            }
        }

        // Update the column
        const updatedColumn = await prisma.column.update({
            where: { id: params.columnId },
            data: {
                title: title?.trim() || undefined,
                order: order !== undefined ? order : undefined
            },
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
        return NextResponse.json({ error: "Error updating column" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { columnId: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get the column to be deleted
        const columnToDelete = await prisma.column.findUnique({
            where: { id: params.columnId }
        });

        if (!columnToDelete) {
            return NextResponse.json({ error: "Column not found" }, { status: 404 });
        }

        // Delete the column and its cards (cascade delete should handle cards)
        await prisma.column.delete({
            where: { id: params.columnId }
        });

        // Update order of remaining columns
        await prisma.column.updateMany({
            where: {
                order: {
                    gt: columnToDelete.order
                }
            },
            data: {
                order: { decrement: 1 }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error deleting column" }, { status: 500 });
    }
}