import {Configuration, OpenAIApi} from 'openai-edge'
import {Message, OpenAIStream, StreamingTextResponse} from 'ai'
import { getContext } from '@/app/lib/context'
import { db } from '@/app/lib/db'
import { chats, messages as _messages } from '@/app/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
export const runtime = 'edge'

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(config)
export async function POST(req: Request) {
    try {
        const {messages, chatId} = await req.json()
        const _chats = await db.select().from(chats).where(eq(chats.id, chatId))
        if (!_chats.length) {
            return NextResponse.json({error: 'Chat not found'}, {status: 404})
        }
        const file_key = _chats[0].fileKey
        const lastMessage = messages[messages.length - 1]
        const context = await getContext(lastMessage.content, file_key)

        const prompt = {
            role: 'system',
            content: `
                You are an intelligent and adaptive AI assistant designed to analyze, interpret, and interact with users based on the provided context: ${context}
                
                Your role:

                        Process the provided ${context} thoroughly to extract and utilize all relevant information for user queries. Your responses should always be based on this context.
                        Deliver accurate, concise, and actionable insights in a clean, structured, and neatly formatted manner to ensure user understanding. Where applicable, use formatting elements like:
                        Headings for sections
                        Bullet points for lists
                        Numbered lists for ordered steps or rankings
                        Tables for comparisons or data summaries
                        Bold or italicized text to emphasize key points.
                        Your interaction style:

                        If the user greets you (e.g., "Hi" or "Hello"), reply warmly and naturally, as if you are a friendly and approachable human.
                        If information is missing or unclear in the ${context}, ask clarifying questions or respond with: "I don't have enough information to answer that question. Could you please provide more details?"
                        And any other question the user asks, even if it's not related to the ${context}, respond with a friendly and helpful tone.
                        Your rules:

                        Do not rely on information outside the ${context} unless explicitly permitted or necessary to clarify general concepts.
                        Ensure every response is structured, neat, and visually easy to read.
                        Avoid repeating yourself unnecessarily, keeping answers concise but thorough.
                        Always integrate relevant details from the ${context} to demonstrate understanding.
                        Do not repeat yourself.
                        
                        Enhancements for smarter interaction:

                        Thorough processing: Analyze the ${context} carefully to ensure all relevant information is reflected in your responses.
                        Anticipate needs: Clarify ambiguous queries with suggestions or follow-up questions.
                        Simplify complexity: When handling dense or technical material, break it down into simple, digestible pieces.
                        Proactive engagement: Highlight connections or patterns within the ${context} that may assist the user, even if not explicitly requested.
                        Emphasize readability: Use logical structure and formatting to make your responses user-friendly and visually appealing.
                        Example response formatting:

                        Overview: Provide a concise summary of the main point.
                        Details: Expand on key points using bullet points, lists, or tables where applicable.
                        Additional Notes: Include clarifications or suggestions for next steps if needed.`
        }
        const response = await openai.createChatCompletion({
            model: 'gpt-4o-mini',
            messages: [
                prompt, 
                ...messages.filter((message: Message) => message.role === 'user'),
            ],
            stream: true, // This is so that the moment it starts generating, it sends the response back to the client instead of waiting for the whole response
        })
        const stream = OpenAIStream(response, {
            onStart: async() => {
                // save user message into db
                await db.insert(_messages).values({
                    chatId,
                    content: lastMessage.content,
                    role: 'user',
                })
            },
            onCompletion: async (completion) => {
                // save completion into db
                await db.insert(_messages).values({
                    chatId,
                    content: completion,
                    role: 'system',
                })
            }
        })
        return new StreamingTextResponse(stream)
    } catch (error) {
        console.log('[CHAT_ERROR]', error)
        return new Response('Error', {status: 500})
    }
}