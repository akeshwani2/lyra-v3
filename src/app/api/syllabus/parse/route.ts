// src/app/api/syllabus/parse/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import PDFParser from 'pdf-parse';
import { prisma } from '@/app/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    console.log('Received request to parse syllabus');
    console.log('FormData:', await req.formData());

    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const courseId = formData.get('courseId') as string;

    if (!file || !courseId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Read file buffer
    const buffer = await file.arrayBuffer();
    let syllabusText = '';

    // Extract text from PDF
    if (file.type === 'application/pdf') {
      // Convert ArrayBuffer to Buffer
      const uint8Array = new Uint8Array(buffer);
      const pdfBuffer = Buffer.from(uint8Array);
      const data = await PDFParser(pdfBuffer);
      syllabusText = data.text;
    } else {
      return new NextResponse('Unsupported file type. Please upload a PDF.', { status: 400 });
    }

    // Use GPT to extract assignments
    const prompt = `
      Please analyze this syllabus text and extract all assignments, exams, and deadlines.
      Return the data in this exact format:
      {
        "assignments": [
          {
            "title": string,
            "dueDate": "YYYY-MM-DD",
            "type": "Assignment" | "Exam" | "Quiz" | "Other"
          }
        ]
      }
      
      Only include items that have clear due dates. Here's the syllabus:
      
      ${syllabusText}
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return new NextResponse('Failed to parse syllabus content', { status: 500 });
    }

    try {
      const parsedData = JSON.parse(content);
      
      // Validate the response has the expected structure
      if (!parsedData.assignments || !Array.isArray(parsedData.assignments)) {
        throw new Error('Invalid response format');
      }

      // Create assignments in database
      const assignments = await Promise.all(
        parsedData.assignments.map(async (item: any) => {
          return await prisma.assignment.create({
            data: {
              courseId,
              userId,
              title: item.title,
              dueDate: item.dueDate,
              type: item.type,
            }
          });
        })
      );

      return NextResponse.json(assignments);

    } catch (error) {
      console.error('Error parsing JSON or saving to database:', error);
      return new NextResponse('Failed to process syllabus data', { status: 500 });
    }

  } catch (error) {
    console.error('Syllabus parsing error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
}