import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, startTime, endTime, location, days } = body;

    // Extract id from the URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop() || '';

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

    const updatedClass = await prisma.classSchedule.update({
      where: {
        id,
        userId
      },
      data: {
        name,
        startTime,
        endTime,
        location,
        days: {
          set: [],  // First clear existing connections
          connect: days.map((dayName: string) => ({ name: dayName }))  // Then connect new days
        }
      },
      include: {
        days: true
      }
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error("[CLASSES_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}