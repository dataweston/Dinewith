import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateRtcToken } from '@/lib/integrations/agora'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { streamId, role = 'publisher' } = body

    if (!streamId) {
      return NextResponse.json({ error: 'Stream ID is required' }, { status: 400 })
    }

    const stream = await prisma.stream.findUnique({
      where: { id: streamId }
    })

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    if (!stream.agoraChannelName || !stream.agoraAppId) {
      return NextResponse.json({ error: 'Stream is not configured for 1:1' }, { status: 400 })
    }

    // Generate UID from user ID
    const uid = parseInt(session.user.id.substring(0, 8), 36) % 1000000

    const token = generateRtcToken(stream.agoraChannelName, uid, role)

    return NextResponse.json({
      success: true,
      appId: stream.agoraAppId,
      channelName: stream.agoraChannelName,
      token,
      uid
    })
  } catch (error) {
    console.error('Error generating Agora token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}
