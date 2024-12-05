import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert note enhancer. When given a full set of notes, organize them into sections. 
          When given a single line or paragraph, simply expand it with:
          1. More detailed explanation
          2. Maybe one brief example if relevant
          3. Fix any grammar issues
          
          For partial content enhancement:
          - Keep the same format/style as the input
          - Don't create new sections or headers
          - Maintain the original meaning
          
          For full note enhancement:
          - Use <h2> tags for main sections with a class="text-2xl font-semibold mb-4 mt-8"
          - Use <h3> tags for subsections with a class="text-xl font-semibold mb-3 mt-6"
          - Use <p> tags for paragraphs with a class="mb-4"
          - Use <strong> for emphasis
          - Ensure proper spacing between sections
          
          Return clean, properly spaced HTML without markdown artifacts.`
        },
        {
          role: "user",
          content: `Enhance these notes with proper HTML formatting:\n\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    let enhancedNotes = completion.choices[0].message.content || '';

    // Clean up and standardize spacing
    enhancedNotes = enhancedNotes
      // Remove any markdown artifacts
      .replace(/^#\s/gm, '')
      .replace(/^##\s/gm, '')
      .replace(/^###\s/gm, '')
      // Add classes to HTML elements
      .replace(/<h2>/g, '<h2 class="text-2xl font-semibold mb-4 mt-8">')
      .replace(/<h3>/g, '<h3 class="text-xl font-semibold mb-3 mt-6">')
      .replace(/<p>/g, '<p class="mb-4">')
      // Fix double spacing
      .replace(/\n\n+/g, '\n')
      // Fix empty paragraphs
      .replace(/<p>\s*<\/p>/g, '')
      // Ensure consistent spacing between sections
      .replace(/<\/h2>\s*<p>/g, '</h2>\n<p>')
      .replace(/<\/h3>\s*<p>/g, '</h3>\n<p>')
      .replace(/<\/p>\s*<h2>/g, '</p>\n\n<h2>')
      .replace(/<\/p>\s*<h3>/g, '</p>\n\n<h3>');

    return NextResponse.json({ enhancedNotes });
  } catch (error) {
    console.error('Error enhancing notes:', error);
    return NextResponse.json(
      { error: 'Failed to enhance notes' },
      { status: 500 }
    );
  }
}