import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, startTime, endTime, location, days } = body;

    // Ensure all days exist
    await Promise.all(
      days.map(async (dayName: string) => {
        await prisma.day.upsert({
          where: { name: dayName },
          update: {},
          create: { name: dayName }
        });
      })
    );

    // Update the class schedule
    const updatedClass = await prisma.classSchedule.update({
      where: {
        id: params.id,
        userId,
      },
      data: {
        name,
        startTime,
        endTime,
        location,
        days: {
          set: [], // First disconnect all days
          connect: days.map((dayName: string) => ({ name: dayName })) // Then connect new days
        }
      },
      include: {
        days: true
      }
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error("[CLASSES_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}