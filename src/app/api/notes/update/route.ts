import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const { id, title, content } = await req.json();

    // If no ID is provided, create a new note
    if (!id) {
      const newNote = await prisma.genNotes.create({
        data: {
          title,
          content,
          userId,
        },
      });
      return NextResponse.json(newNote);
    }

    // Otherwise, update existing note
    const updatedNote = await prisma.genNotes.update({
      where: {
        id,
        userId, // Ensure the note belongs to the user
      },
      data: {
        title,
        content,
      },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Note update error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to save note' }),
      { status: 400 }
    );
  }
}
