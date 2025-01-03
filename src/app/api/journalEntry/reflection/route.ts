import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { orderBy } from "lodash";
import { stringify } from "querystring";
import { JournalEntryType } from "@prisma/client";
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    console.log("Attempting to fetch reflection entry for user:", userId);

    const entry = await prisma.journalEntry.findFirst({
      where: {
        userId,
        type: JournalEntryType.REFLECTION,
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
  // This is a function that handles PUT requests. It's async because it does operations that take time

  try {
    const { userId } = await auth();
    // Gets the user's ID from Clerk authentication service. The await means "wait for this to finish"

    if (!userId) {
      return new NextResponse("Unauthorized:", { status: 401 });
    }
    // If there's no user ID, return an error saying they're not allowed to do this

    const { content } = await req.json();
    // Takes the data sent in the request and extracts the 'content' field
    // req.json() converts the raw request data into a JavaScript object

    console.log("Attempting to save journal entry for user:", userId);
    // Prints a message to the server logs for debugging

    const entry = await prisma.journalEntry.upsert({
      // 'upsert' means "update if exists, insert if doesn't exist"
      where: {
        userId_type: {
          userId: userId,
          type: JournalEntryType.REFLECTION,
        },
      },
      update: {
        content, // If found, update the content
      },
      create: {
        userId, // If not found, create new entry with
        content, // both userId and content
        type: JournalEntryType.REFLECTION,
      },
    });

    console.log("Journal entry save result:", entry);
    // Prints the result to server logs

    return NextResponse.json(entry);
    // Sends the saved entry back to the client as a JSON response
  } catch (error) {
    console.error("PUT Detailed error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal error",
        details: error instanceof Error ? error.message : "Unknown Error",
      }),
      { status: 500 }
    );
  }
}
