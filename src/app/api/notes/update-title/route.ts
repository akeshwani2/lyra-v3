import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { noteId, title } = await request.json();

    if (!title || !noteId) {
      return NextResponse.json({ error: 'Title and noteId are required' }, { status: 400 });
    }

    // Update the specific note
    const updatedNote = await prisma.genNotes.update({
      where: { 
        id: noteId,
        userId, // Ensure the note belongs to the user
      },
      data: { title },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Update title error:', error);
    return NextResponse.json(
      { error: 'Failed to update title' }, 
      { status: 500 }
    );
  }
}