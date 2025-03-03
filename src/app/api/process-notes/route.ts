import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.DEEPGRAM_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (text.split(" ").length < 20) {
      return NextResponse.json({
        notes: `Quick Recording:\n\n${text}\n\n(Note: For best results, try recording at least a few sentences of lecture content)`,
      });
    }

    const completion = await openai.chat.completions.create({
      model: "base",
      messages: [
        {
          role: "system",
          content: `Transform audio transcriptions into elegant, well-structured notes using HTML. Structure your response as follows:

<h3>Topic:</h3>
[Provide a clear, descriptive title for the audio content]

<h3>Core Concepts:</h3>
[Present main concepts in clear, flowing paragraphs. Use simple text notation for mathematical expressions (e.g., "x^2" instead of LaTeX notation, use <strong> tags for emphasis).]

<h3>Detailed Explanation:</h3>
[Expand on the concepts with thorough explanations, examples, and any relevant mathematical formulas. Break into focused paragraphs, each developing a single idea. Use simple text notation for math. Include practical applications where relevant.]

<h3>Key Insights:</h3>
[Synthesize the most important takeaways and deeper understanding gained from the audio. Focus on connections between concepts and their broader implications.]

Remember to:
- Write in clear, flowing paragraphs rather than bullet points
- Write math in simple text notation (e.g., "x^2", "sqrt(x)", etc.)
- Maintain a scholarly yet accessible tone
- Include relevant examples and applications
- If you have information that you think would benefit the user, include it in the notes
- Highlight relationships between concepts
- Use <strong> tags for emphasis
- The audio can be anything, from a lecture to a podcast to a conversation or anything else, so make sure to include all relevant information.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    return NextResponse.json({ notes: completion.choices[0].message.content });
  } catch (error) {
    console.error("Notes processing error:", error);
    return NextResponse.json(
      { error: "Notes processing failed" },
      { status: 500 }
    );
  }
}
