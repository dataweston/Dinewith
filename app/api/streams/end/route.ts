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

    if (stream.status !== 'LIVE') {
      return NextResponse.json({ error: 'Stream is not live' }, { status: 400 })
    }

    // Calculate duration
    const duration = stream.startedAt
      ? Math.floor((new Date().getTime() - stream.startedAt.getTime()) / 1000)
      : 0

    // Update stream status
    const updated = await prisma.stream.update({
      where: { id: streamId },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
        duration
      }
    })

    return NextResponse.json({
      success: true,
      stream: {
        id: updated.id,
        status: updated.status,
        endedAt: updated.endedAt,
        duration: updated.duration
      }
    })
  } catch (error) {
    console.error('Error ending stream:', error)
    return NextResponse.json(
      { error: 'Failed to end stream' },
      { status: 500 }
    )
  }
}
