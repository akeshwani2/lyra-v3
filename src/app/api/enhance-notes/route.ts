import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI with DeepSeek's base URL
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.ai/v1',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { content, isPartialContent } = await req.json();

    const systemPrompt = isPartialContent 
      ? `You are an expert note enhancer. Enhance the selected text by:
         1. Expanding with relevant details and examples
         2. Fixing any grammar issues
         3. Maintaining the original context
         4. Return the enhanced content wrapped in a single <p> tag
         
         Example:
         Input: "quantum computers use qubits"
         Output: <p>quantum computers use qubits (quantum bits), which can exist in multiple states simultaneously due to quantum superposition, unlike classical bits that can only be 0 or 1</p>`
      : `You are an expert note enhancer. When given a full set of notes, organize them into sections with:
         - <h3> tags for main sections
         - Unless the <h3> tag is the first line, any other <h3> tags should have a margin-top of 8px
         - <p> tags for paragraphs
         - <strong> for emphasis
         - Proper spacing between sections
         - If math is included, just write it out in plain text, just use <strong> tags for emphasis
         - Expanded details and examples
         - Fixed grammar issues`;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat", // Use the appropriate DeepSeek model
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Enhance these notes with proper formatting:\n\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    let enhancedNotes = completion.choices[0].message.content || "";

    // Only apply HTML cleanup for full content enhancement
    if (!isPartialContent) {
      enhancedNotes = enhancedNotes
        .replace(/<h2>/g, '<h2 class="text-2xl font-semibold mb-4 mt-8">')
        .replace(/<h3>/g, '<h3 class="text-xl font-semibold mb-3 mt-6">')
        .replace(/<p>/g, '<p class="mb-4">')
        .replace(/\n\n+/g, "\n")
        .replace(/<p>\s*<\/p>/g, "")
        .replace(/<\/h2>\s*<p>/g, "</h2>\n<p>")
        .replace(/<\/h3>\s*<p>/g, "</h3>\n<p>")
        .replace(/<\/p>\s*<h2>/g, "</p>\n\n<h2>")
        .replace(/<\/p>\s*<h3>/g, "</p>\n\n<h3>");
    }

    return NextResponse.json({ enhancedNotes });
  } catch (error) {
    console.error("Error enhancing notes:", error);
    return NextResponse.json(
      { error: "Failed to enhance notes" },
      { status: 500 }
    );
  }
}