import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const courses = await prisma.course.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('[COURSES_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { name, color } = body

    if (!name || !color) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    console.log('Creating course with:', { name, color, userId })

    const course = await prisma.course.create({
      data: {
        name,
        color,
        userId
      }
    })

    console.log('Course created:', course)

    return NextResponse.json(course)
  } catch (error) {
    console.error('[COURSES_POST] Detailed error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new NextResponse(
      JSON.stringify({ error: errorMessage }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}