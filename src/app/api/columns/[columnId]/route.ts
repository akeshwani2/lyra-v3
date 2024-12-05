import { prisma } from '@/app/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extract columnId from URL
        const columnId = request.url.split('/columns/')[1].split('/')[0];

        if (!columnId) {
            return NextResponse.json({ error: "Column ID not provided" }, { status: 400 });
        }

        // Delete the column (and all its cards due to cascade delete)
        await prisma.column.delete({
            where: { id: columnId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error deleting column" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extract columnId from URL
        const columnId = request.url.split('/columns/')[1].split('/')[0];
        const { title } = await request.json();

        const updatedColumn = await prisma.column.update({
            where: { id: columnId },
            data: { title }
        });

        return NextResponse.json(updatedColumn);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error updating column" }, { status: 500 });
    }
}