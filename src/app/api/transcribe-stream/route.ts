import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const isPartial = formData.get('isPartial') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      prompt: isPartial ? 'This is a continuation of a previous transcription.' : undefined,
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error('Streaming transcription error:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
} 