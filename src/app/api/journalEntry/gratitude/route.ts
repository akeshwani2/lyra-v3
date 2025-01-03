import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { JournalEntryType } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    console.log("Attempting to fetch gratitude entry for user:", userId);

    const entry = await prisma.journalEntry.findFirst({
      where: { 
        userId,
        type: JournalEntryType.GRATITUDE 
      },
      orderBy: { updatedAt: "desc" },
    });

    console.log("Journal Entry fetch results:", entry);
    return NextResponse.json(entry);
  } catch (error) {
    console.error("Detailed error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content } = await req.json();
    console.log("Attempting to save gratitude entry for user:", userId);

    const entry = await prisma.journalEntry.upsert({
      where: {
        userId_type: {
          userId,
          type: JournalEntryType.GRATITUDE,
        },
      },
      update: {
        content,
      },
      create: {
        userId,
        content,
        type: JournalEntryType.GRATITUDE,
      },
    });

    console.log("Journal entry save result:", entry);
    return NextResponse.json(entry);
  } catch (error) {
    console.error("PUT Detailed error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}