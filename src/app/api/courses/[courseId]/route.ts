import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, color } = body;

    if (!name || !color) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const course = await prisma.course.update({
      where: {
        id: params.courseId,
        userId,
      },
      data: {
        name,
        color,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First delete all assignments associated with this course
    await prisma.assignment.deleteMany({
      where: {
        courseId: params.courseId,
      },
    });

    // Then delete the course
    const deletedCourse = await prisma.course.delete({
      where: {
        id: params.courseId,
        userId,
      },
    });

    return NextResponse.json(deletedCourse);
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
