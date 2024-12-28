import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function PATCH(
  req: NextRequest
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { title, dueDate, type, courseId, completed } = body;

    // Extract assignmentId from the URL
    const url = new URL(req.url);
    const assignmentId = url.pathname.split('/').pop() || '';

    // Verify that the assignment belongs to the user
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        userId
      }
    });

    if (!assignment) {
      return new NextResponse('Assignment not found', { status: 404 });
    }

    // Update the assignment
    const updatedAssignment = await prisma.assignment.update({
      where: {
        id: assignmentId,
        userId
      },
      data: {
        ...(title && { title }),
        ...(dueDate && { dueDate }),
        ...(type && { type }),
        ...(courseId && { courseId }),
        ...(completed !== undefined && { completed }),
      }
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error('Assignment update error:', error);
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

export async function DELETE(
  request: NextRequest
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Extract assignmentId from the URL
    const url = new URL(request.url);
    const assignmentId = url.pathname.split('/').pop() || '';

    // Verify the assignment belongs to the user
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        userId
      }
    });

    if (!assignment) {
      return new NextResponse('Assignment not found', { status: 404 });
    }

    // Delete the assignment
    const deletedAssignment = await prisma.assignment.delete({
      where: {
        id: assignmentId,
        userId
      }
    });

    return NextResponse.json(deletedAssignment);
  } catch (error) {
    console.error('Assignment deletion error:', error);
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