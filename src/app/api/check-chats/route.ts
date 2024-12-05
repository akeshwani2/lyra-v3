import { db } from '@/app/lib/db';
import { chats } from '@/app/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { desc, eq, asc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userChats = await db
            .select()
            .from(chats)
            .where(eq(chats.userId, userId))
            .orderBy(asc(chats.createdAt));

        if (!userChats.length) {
            return NextResponse.json({
                hasChats: false,
                firstChatId: null,
                mostRecentChatId: null,
                pdfName: null,
                pdfUrl: null,
            });
        }

        const firstChat = userChats[0];

        return NextResponse.json({
            hasChats: true,
            firstChatId: firstChat.id,
            mostRecentChatId: firstChat.id,
            pdfName: firstChat.pdfName,
            pdfUrl: firstChat.pdfUrl,
        });
    } catch (error) {
        console.error('Error in check-chats:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}