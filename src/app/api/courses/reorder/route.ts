import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const { courseIds } = await req.json();
    
    // Update each course's order in sequence
    await Promise.all(
      courseIds.map((id: string, index: number) =>
        prisma.course.update({
          where: { id },
          data: { position: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reorder courses:', error);
    return NextResponse.json(
      { error: 'Failed to reorder courses' },
      { status: 500 }
    );
  }
}