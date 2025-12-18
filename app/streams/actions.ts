'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Session } from '@/lib/types'

export async function createStream(data: {
  title: string
  description?: string
  type: 'ONE_TO_ONE' | 'SMALL_GROUP' | 'BROADCAST'
}) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  if (session.user.role !== 'HOST' && session.user.role !== 'ADMIN') {
    return { error: 'Only hosts can create streams' }
  }

  try {
    const stream = await prisma.stream.create({
      data: {
        hostId: session.user.id,
        title: data.title,
        description: data.description,
        type: data.type,
        status: 'CREATED'
      }
    })

    // TODO: Initialize Livepeer or Agora stream
    // For broadcast: Call Livepeer API
    // For 1:1: Generate Agora token

    revalidatePath('/host/streams')
    return { stream }
  } catch (error) {
    console.error('Error creating stream:', error)
    return { error: 'Failed to create stream' }
  }
}

export async function startStream(streamId: string) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const stream = await prisma.stream.findUnique({
      where: { id: streamId }
    })

    if (!stream) {
      return { error: 'Stream not found' }
    }

    if (stream.hostId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    const updated = await prisma.stream.update({
      where: { id: streamId },
      data: {
        status: 'LIVE',
        startedAt: new Date()
      }
    })

    revalidatePath('/host/streams')
    revalidatePath(`/stream/${streamId}`)
    return { stream: updated }
  } catch (error) {
    console.error('Error starting stream:', error)
    return { error: 'Failed to start stream' }
  }
}

export async function endStream(streamId: string) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const stream = await prisma.stream.findUnique({
      where: { id: streamId }
    })

    if (!stream) {
      return { error: 'Stream not found' }
    }

    if (stream.hostId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    const duration = stream.startedAt 
      ? Math.floor((Date.now() - stream.startedAt.getTime()) / 1000)
      : 0

    const vodExpiresAt = new Date()
    vodExpiresAt.setDate(vodExpiresAt.getDate() + 7) // 7-day retention

    const updated = await prisma.stream.update({
      where: { id: streamId },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
        duration,
        vodExpiresAt
      }
    })

    revalidatePath('/host/streams')
    return { stream: updated }
  } catch (error) {
    console.error('Error ending stream:', error)
    return { error: 'Failed to end stream' }
  }
}

export async function getMyStreams() {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const streams = await prisma.stream.findMany({
      where: { hostId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return { streams }
  } catch (error) {
    console.error('Error fetching streams:', error)
    return { error: 'Failed to fetch streams' }
  }
}

export async function getLiveStreams() {
  try {
    const streams = await prisma.stream.findMany({
      where: { status: 'LIVE' },
      include: {
        host: {
          select: {
            name: true,
            hostProfile: {
              select: {
                displayName: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    })

    return { streams }
  } catch (error) {
    console.error('Error fetching live streams:', error)
    return { error: 'Failed to fetch live streams' }
  }
}
