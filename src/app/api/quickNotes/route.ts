// app/api/quickNotes/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("Attempting to fetch quick note for user:", userId);

    const note = await prisma.quickNotes.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    console.log("Quick note fetch result:", note);
    return NextResponse.json(note);
    
  } catch (error) {
    console.error("[QUICKNOTES_GET] Detailed error:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal error", 
        details: error instanceof Error ? error.message : "Unknown error" 
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
    console.log("Attempting to save quick note for user:", userId);

    const note = await prisma.quickNotes.upsert({
      where: { 
        userId: userId 
      },
      update: { 
        content 
      },
      create: {
        userId,
        content
      }
    });

    console.log("Quick note save result:", note);
    return NextResponse.json(note);
    
  } catch (error) {
    console.error("[QUICKNOTES_PUT] Detailed error:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }), 
      { status: 500 }
    );
  }
}