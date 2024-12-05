import { db } from '@/app/lib/db'
import { chats, messages } from '@/app/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extract chatId from the request URL
        const url = new URL(request.url);
        const chatId = parseInt(url.pathname.split('/').pop() || '');

        // First delete all messages associated with this chat
        await db.delete(messages).where(eq(messages.chatId, chatId));
        
        // Then delete the chat itself
        await db.delete(chats).where(eq(chats.id, chatId));
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting chat:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}