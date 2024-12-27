import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { title, cards } = await req.json();

    const flashcardSet = await prisma.flashcardSet.create({
      data: {
        title,
        userId,
        cards: {
          create: cards.map((card: any) => ({
            question: card.question,
            answer: card.answer,
          })),
        },
      },
      include: {
        cards: true,
      },
    });

    return NextResponse.json(flashcardSet);
  } catch (error) {
    console.error('Error creating flashcard set:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const flashcardSets = await prisma.flashcardSet.findMany({
      where: {
        userId,
      },
      include: {
        cards: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(flashcardSets);
  } catch (error) {
    console.error('Error fetching flashcard sets:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}