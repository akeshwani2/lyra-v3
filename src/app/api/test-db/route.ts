import { db } from "@/app/lib/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { chats, messages } from "@/app/lib/db/schema";

export async function GET(request: Request) {
  try {
    // Try to select from both tables
    const chatResults = await db.select().from(chats);
    const messageResults = await db.select().from(messages);
    
    return NextResponse.json({ 
      status: "connected",
      chatsCount: chatResults.length,
      messagesCount: messageResults.length,
      chats: chatResults,
      messages: messageResults
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        error: "Database test failed", 
        message: error instanceof Error ? error.message : "Unknown error",
        details: error 
      },
      { status: 500 }
    );
  }
}