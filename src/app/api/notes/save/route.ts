import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    console.log('Attempting to save note:', { userId, title, contentLength: content.length });

    const note = await prisma.genNotes.create({
      data: {
        userId,
        title: title || `Notes ${new Date().toLocaleString()}`,
        content,
      },
    });

    console.log('Note saved successfully:', note.id);
    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error('Detailed save note error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save note',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
