import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createLivepeerStream } from '@/lib/integrations/livepeer'
import { createAgoraRoom } from '@/lib/integrations/agora'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only hosts can create streams
    const userRole = (session.user as any).role
    if (userRole !== 'HOST' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Must be a host to create streams' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, type = 'BROADCAST' } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    let streamData: any = {}

    if (type === 'ONE_TO_ONE') {
      // Use Agora for 1:1
      const channelName = `dinewith_${session.user.id}_${Date.now()}`
      const agoraRoom = await createAgoraRoom({
        channelName,
        hostUid: parseInt(session.user.id.substring(0, 8), 36) % 1000000,
        guestUid: 0 // Will be set when guest joins
      })

      streamData = {
        agoraChannelName: channelName,
        agoraAppId: agoraRoom.appId
      }
    } else {
      // Use Livepeer for broadcast/group
      const livepeerStream = await createLivepeerStream({
        name: title
      })

      streamData = {
        livepeerStreamId: livepeerStream.streamId,
        playbackId: livepeerStream.playbackId,
        streamKey: livepeerStream.streamKey
      }
    }

    // Calculate VOD expiry (7 days from now)
    const vodExpiresAt = new Date()
    vodExpiresAt.setDate(vodExpiresAt.getDate() + 7)

    const stream = await prisma.stream.create({
      data: {
        hostId: session.user.id,
        title,
        description,
        type: type as any,
        vodExpiresAt,
        ...streamData
      }
    })

    return NextResponse.json({
      success: true,
      stream: {
        id: stream.id,
        title: stream.title,
        type: stream.type,
        status: stream.status,
        ...streamData
      }
    })
  } catch (error) {
    console.error('Error creating stream:', error)
    return NextResponse.json(
      { error: 'Failed to create stream' },
      { status: 500 }
    )
  }
}
