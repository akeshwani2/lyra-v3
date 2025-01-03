import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { JournalEntryType } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
      const { userId } = await auth();
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
  
      // Extract the type from the URL
      const type = req.url.split('/').pop()?.toUpperCase();
      console.log("GET Request - Type:", type, "UserId:", userId);
  
      if (!type || !Object.values(JournalEntryType).includes(type as JournalEntryType)) {
        console.error("Invalid type requested:", type);
        return new NextResponse("Invalid entry type", { status: 400 });
      }
  
      const entry = await prisma.journalEntry.findFirst({
        where: { 
          userId,
          type: type as JournalEntryType
        },
        orderBy: { updatedAt: "desc" },
      });
  
      console.log("GET Request - Found entry:", entry);
  
      if (!entry) {
        console.log("No entry found for type:", type);
        return NextResponse.json(null);
      }
  
      return NextResponse.json(entry);
    } catch (error) {
      console.error("GET Request - Error:", error);
      return new NextResponse(
        JSON.stringify({
          error: "Internal error",
          details: error instanceof Error ? error.message : "Unknown error",
        }),
        { status: 500 }
      );
    }
  }