import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        userId
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { courseId, title, dueDate, type, link } = body;

    // Validate required fields
    if (!courseId || !title || !dueDate || !type) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        userId
      }
    });

    if (!course) {
      return new NextResponse('Course not found', { status: 404 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId,
        title,
        dueDate,
        type,
        userId,
        link: link || null
      }
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
