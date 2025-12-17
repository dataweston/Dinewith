import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { streamId } = body

    if (!streamId) {
      return NextResponse.json({ error: 'Stream ID is required' }, { status: 400 })
    }

    // Verify ownership
    const stream = await prisma.stream.findUnique({
      where: { id: streamId }
    })

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    if (stream.hostId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (stream.status !== 'CREATED') {
      return NextResponse.json({ error: 'Stream already started' }, { status: 400 })
    }

    // Update stream status
    const updated = await prisma.stream.update({
      where: { id: streamId },
      data: {
        status: 'LIVE',
        startedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      stream: {
        id: updated.id,
        status: updated.status,
        startedAt: updated.startedAt
      }
    })
  } catch (error) {
    console.error('Error starting stream:', error)
    return NextResponse.json(
      { error: 'Failed to start stream' },
      { status: 500 }
    )
  }
}
