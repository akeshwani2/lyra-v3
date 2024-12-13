import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

export async function PATCH(
    request: NextRequest
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extract columnId from URL
        const url = new URL(request.url);
        const columnId = url.pathname.split('/').reverse()[1];

        const { title, order } = await request.json();

        // If changing order, update other columns' orders
        if (order !== undefined) {
            const currentColumn = await prisma.column.findUnique({
                where: { id: columnId }
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
                                id: columnId
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
                                id: columnId
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
            where: { id: columnId },
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
    request: NextRequest
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extract columnId from URL
        const url = new URL(request.url);
        const columnId = url.pathname.split('/').reverse()[1];

        // Get the column to be deleted
        const columnToDelete = await prisma.column.findUnique({
            where: { id: columnId }
        });

        if (!columnToDelete) {
            return NextResponse.json({ error: "Column not found" }, { status: 404 });
        }

        // Delete the column and its cards (cascade delete should handle cards)
        await prisma.column.delete({
            where: { id: columnId }
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