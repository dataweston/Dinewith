'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Session } from '@/lib/types'

const PLATFORM_FEE_PERCENT = 0.04 // 4%

export async function createBookingRequest(data: {
  listingId: string
  scheduledStart: Date
  scheduledEnd: Date
  guestCount: number
  guestNotes?: string
}) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    // Get listing details
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId }
    })

    if (!listing || listing.status !== 'ACTIVE') {
      return { error: 'Listing not available' }
    }

    // Calculate pricing
    const totalAmount = listing.priceAmount * data.guestCount
    const platformFee = Math.round(totalAmount * PLATFORM_FEE_PERCENT)
    const hostAmount = totalAmount - platformFee

    const booking = await prisma.booking.create({
      data: {
        listingId: data.listingId,
        guestId: session.user.id,
        scheduledStart: data.scheduledStart,
        scheduledEnd: data.scheduledEnd,
        guestCount: data.guestCount,
        guestNotes: data.guestNotes,
        totalAmount,
        platformFee,
        hostAmount,
        status: 'REQUESTED'
      }
    })

    revalidatePath(`/listing/${listing.slug}`)
    return { booking }
  } catch (error) {
    console.error('Error creating booking:', error)
    return { error: 'Failed to create booking request' }
  }
}

export async function acceptBooking(bookingId: string) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    // Verify host owns the listing
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          include: { hostProfile: true }
        }
      }
    })

    if (!booking) {
      return { error: 'Booking not found' }
    }

    if (booking.listing.hostProfile.userId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    if (booking.status !== 'REQUESTED') {
      return { error: 'Booking already processed' }
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'ACCEPTED' }
    })

    revalidatePath('/host/bookings')
    return { booking: updated }
  } catch (error) {
    console.error('Error accepting booking:', error)
    return { error: 'Failed to accept booking' }
  }
}

export async function declineBooking(bookingId: string, reason?: string) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          include: { hostProfile: true }
        }
      }
    })

    if (!booking) {
      return { error: 'Booking not found' }
    }

    if (booking.listing.hostProfile.userId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELED',
        cancelReason: reason
      }
    })

    revalidatePath('/host/bookings')
    return { booking: updated }
  } catch (error) {
    console.error('Error declining booking:', error)
    return { error: 'Failed to decline booking' }
  }
}

export async function getMyBookings() {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: { guestId: session.user.id },
      include: {
        listing: {
          include: {
            hostProfile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return { bookings }
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return { error: 'Failed to fetch bookings' }
  }
}

export async function getHostBookings() {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!hostProfile) {
      return { error: 'Host profile not found' }
    }

    const bookings = await prisma.booking.findMany({
      where: {
        listing: {
          hostProfileId: hostProfile.id
        }
      },
      include: {
        listing: true,
        guest: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return { bookings }
  } catch (error) {
    console.error('Error fetching host bookings:', error)
    return { error: 'Failed to fetch bookings' }
  }
}
