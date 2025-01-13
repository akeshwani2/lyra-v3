import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content } = await req.json();
    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    const prompt = `Create 10+ flashcards from the following notes. Each flashcard should have a question and answer that tests key concepts and important details:

${content}

Format your response as a JSON object with a "cards" array containing objects with "question" and "answer" properties.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are the smartest flashcard creator in the world. You create concise and effective flashcards from study notes. Create 10+ flashcards based on the notes provided.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return NextResponse.json(result);

  } catch (error) {
    console.error("[FLASHCARDS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}