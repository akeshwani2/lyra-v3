import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const flashcardSet = await prisma.flashcardSet.findUnique({
      where: {
        id: params.id,
        userId,
      },
      include: {
        cards: true,
      },
    });

    if (!flashcardSet) {
      return new NextResponse('Not Found', { status: 404 });
    }

    return NextResponse.json(flashcardSet);
  } catch (error) {
    console.error('Error fetching flashcard set:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.flashcardSet.delete({
      where: {
        id: params.id,
        userId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting flashcard set:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}