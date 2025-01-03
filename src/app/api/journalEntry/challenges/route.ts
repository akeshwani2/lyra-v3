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
    console.log("Attempting to fetch journal entry for user:", userId);

    const entry = await prisma.journalEntry.findFirst({
      where: {
        userId,
        type: JournalEntryType.CHALLENGES,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    console.log("journal entry fetch results:", entry);
    return NextResponse.json(entry);
  } catch (error) {
    console.error("Detailed error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal Error",
        details: error instanceof Error ? error.message : "Unknown Error",
      }),
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }
        const { content } = await req.json()
        const entry = await prisma.journalEntry.upsert({
            where: {
                userId_type: {
                    userId: userId,
                    type: JournalEntryType.CHALLENGES,
                },
            },
            update: {
                content,
            },
            create: {
                userId,
                content,
                type: JournalEntryType.CHALLENGES
            }
        })

        console.log("Journal entry fetch results: ", entry)
        return NextResponse.json(entry)
    } catch (error) {
        console.error("Detailed error:", error)
        return new NextResponse(
            JSON.stringify({
                error: "Detailed error",
                details: error instanceof Error ? error.message : "Unknown Error"
            }), { status: 500 }
        )
    }
}