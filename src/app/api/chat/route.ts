import { GoogleGenerativeAI } from '@google/generative-ai'
import { Message, StreamingTextResponse } from 'ai'
import { getContext } from '@/app/lib/context'
import { db } from '@/app/lib/db'
import { chats, messages as _messages } from '@/app/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
export const runtime = 'edge'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const { messages, chatId } = await req.json()
        const _chats = await db.select().from(chats).where(eq(chats.id, chatId))
        if (!_chats.length) {
            return NextResponse.json({error: 'Chat not found'}, {status: 404})
        }
        const file_key = _chats[0].fileKey
        const lastMessage = messages[messages.length - 1]
        const context = await getContext(lastMessage.content, file_key)

        const prompt = `You are an intelligent and adaptive AI assistant designed to analyze, interpret, and interact with users based on the provided context: ${context}
                
                Your role:
                        Do not say "Hello" or "Hi" if you've already said it.
                        Process the provided ${context} thoroughly to extract and utilize all relevant information for user queries. Your responses should always be based on this context.
                        Deliver accurate, concise, and actionable insights in a clean, structured, and neatly formatted manner to ensure user understanding.
                        
                Your interaction style:
                        If the user greets you, reply warmly and naturally, as if you are a friendly and approachable human, but don't repeat yourself.
                        If information is missing or unclear in the ${context}, ask clarifying questions or respond with: "I don't have enough information to answer that question."
                        And any other question the user asks, even if it's not related to the ${context}, respond with a friendly and helpful tone.`

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const chat = model.startChat({
            history: messages.map((msg: Message) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: msg.content,
            })),
            generationConfig: {
                maxOutputTokens: 2048,
            },
        });

        const result = await chat.sendMessageStream(lastMessage.content);
        
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    controller.enqueue(encoder.encode(text));
                }
                controller.close();
            },
        });

        const response = new StreamingTextResponse(stream);
        
        // Handle message storage separately to avoid TypeScript errors with ResponseInit
        await db.insert(_messages).values({
            chatId,
            content: lastMessage.content,
            role: 'user',
        });

        result.response.then(async (fullResponse) => {
            await db.insert(_messages).values({
                chatId,
                content: fullResponse.text(),
                role: 'system',
            });
        });

        return response;
    } catch (error) {
        console.log('[CHAT_ERROR]', error)
        return new Response('Error', {status: 500})
    }
}