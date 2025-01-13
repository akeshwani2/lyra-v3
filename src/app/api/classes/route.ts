import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, startTime, endTime, location, days } = body;

    // First, ensure all necessary days exist
    await Promise.all(
      days.map(async (dayName: string) => {
        await prisma.day.upsert({
          where: { name: dayName },
          update: {},
          create: { name: dayName }
        });
      })
    );

    // Then create the class schedule
    const classSchedule = await prisma.classSchedule.create({
      data: {
        name,
        startTime,
        endTime,
        location,
        userId,
        days: {
          connect: days.map((dayName: string) => ({ name: dayName }))
        }
      },
      include: {
        days: true
      }
    });

    return NextResponse.json(classSchedule);
  } catch (error) {
    console.error("[CLASSES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const classes = await prisma.classSchedule.findMany({
      where: {
        userId
      },
      include: {
        days: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error("[CLASSES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new NextResponse("Class ID required", { status: 400 });
    }

    await prisma.classSchedule.delete({
      where: {
        id,
        userId
      }
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[CLASSES_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
