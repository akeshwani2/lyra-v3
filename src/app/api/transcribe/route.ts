import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Split audio into chunks if it's too large (Whisper has a 25MB limit)
    if (file.size > 25 * 1024 * 1024) {
      // For large files, we'll use streaming transcription
      // This will be handled by the frontend's Web Speech API
      return NextResponse.json({ error: 'File too large, using browser transcription' }, { status: 413 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}