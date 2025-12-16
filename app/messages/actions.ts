'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Session } from '@/lib/types'

export async function sendMessage(data: {
  bookingId: string
  content: string
}) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    // Verify user is part of the booking
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: {
        listing: {
          include: {
            hostProfile: true
          }
        }
      }
    })

    if (!booking) {
      return { error: 'Booking not found' }
    }

    const isGuest = booking.guestId === session.user.id
    const isHost = booking.listing.hostProfile.userId === session.user.id

    if (!isGuest && !isHost) {
      return { error: 'Unauthorized' }
    }

    const recipientId = isGuest
      ? booking.listing.hostProfile.userId
      : booking.guestId

    const message = await prisma.message.create({
      data: {
        bookingId: data.bookingId,
        senderId: session.user.id,
        recipientId,
        content: data.content
      }
    })

    revalidatePath(`/messages/${data.bookingId}`)
    return { message }
  } catch (error) {
    console.error('Error sending message:', error)
    return { error: 'Failed to send message' }
  }
}

export async function getBookingMessages(bookingId: string) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    // Verify access
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          include: {
            hostProfile: true
          }
        }
      }
    })

    if (!booking) {
      return { error: 'Booking not found' }
    }

    const isGuest = booking.guestId === session.user.id
    const isHost = booking.listing.hostProfile.userId === session.user.id

    if (!isGuest && !isHost) {
      return { error: 'Unauthorized' }
    }

    const messages = await prisma.message.findMany({
      where: { bookingId },
      include: {
        sender: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        bookingId,
        recipientId: session.user.id,
        isRead: false
      },
      data: { isRead: true }
    })

    return { messages, booking }
  } catch (error) {
    console.error('Error fetching messages:', error)
    return { error: 'Failed to fetch messages' }
  }
}
