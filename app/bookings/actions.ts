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

    // Check for booking conflicts
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        listingId: data.listingId,
        status: {
          in: ['REQUESTED', 'ACCEPTED', 'AUTHORIZED']
        },
        OR: [
          {
            AND: [
              { scheduledStart: { lte: data.scheduledStart } },
              { scheduledEnd: { gt: data.scheduledStart } }
            ]
          },
          {
            AND: [
              { scheduledStart: { lt: data.scheduledEnd } },
              { scheduledEnd: { gte: data.scheduledEnd } }
            ]
          },
          {
            AND: [
              { scheduledStart: { gte: data.scheduledStart } },
              { scheduledEnd: { lte: data.scheduledEnd } }
            ]
          }
        ]
      }
    })

    if (conflictingBookings.length > 0) {
      return { error: 'This time slot is already booked or pending' }
    }

    // Validate guest count
    if (data.guestCount > listing.maxGuests) {
      return { error: `Maximum ${listing.maxGuests} guest${listing.maxGuests > 1 ? 's' : ''} allowed` }
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
        },
        guest: {
          select: {
            email: true,
            name: true
          }
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

    // Send email notification to guest
    if (booking.guest?.email) {
      try {
        const { sendBookingAcceptedEmail } = await import('@/lib/email')
        await sendBookingAcceptedEmail(
          booking.guest.email,
          booking.listing.hostProfile.displayName,
          booking.listing.title,
          `${new Date(booking.scheduledStart).toLocaleString()} - ${new Date(booking.scheduledEnd).toLocaleString()}`
        )
      } catch (emailError) {
        console.error('Failed to send booking accepted email:', emailError)
      }
    } else {
      console.warn('Guest email missing for booking', booking.id)
    }

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

export async function completeBooking(bookingId: string) {
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

    if (booking.status !== 'AUTHORIZED' && booking.status !== 'ACCEPTED') {
      return { error: 'Booking cannot be completed in current status' }
    }

    // Capture payment if authorized
    let captureSuccess = false
    if (booking.status === 'AUTHORIZED' && booking.paymentIntentId) {
      try {
        const captureResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/capture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: booking.id,
            paymentIntentId: booking.paymentIntentId,
            amount: booking.totalAmount
          })
        })

        if (captureResponse.ok) {
          captureSuccess = true
        }
      } catch (captureError) {
        console.error('Payment capture failed:', captureError)
        return { error: 'Failed to capture payment' }
      }
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'COMPLETED',
        capturedAt: captureSuccess ? new Date() : booking.capturedAt
      }
    })

    revalidatePath('/host/bookings')
    return { booking: updated }
  } catch (error) {
    console.error('Error completing booking:', error)
    return { error: 'Failed to complete booking' }
  }
}

export async function markNoShow(bookingId: string) {
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

    if (booking.status !== 'AUTHORIZED' && booking.status !== 'ACCEPTED') {
      return { error: 'Invalid booking status' }
    }

    // For no-show, capture full payment (host keeps 100% per refund policy)
    if (booking.paymentIntentId && booking.status === 'AUTHORIZED') {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/capture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: booking.id,
            paymentIntentId: booking.paymentIntentId,
            amount: booking.totalAmount
          })
        })
      } catch (captureError) {
        console.error('Payment capture failed:', captureError)
      }
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'NO_SHOW',
        capturedAt: new Date()
      }
    })

    revalidatePath('/host/bookings')
    return { booking: updated }
  } catch (error) {
    console.error('Error marking no-show:', error)
    return { error: 'Failed to mark as no-show' }
  }
}

export async function createReview(data: {
  bookingId: string
  rating: number
  comment?: string
  communicationRating?: number
  experienceRating?: number
  valueRating?: number
}) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      return { error: 'Rating must be between 1 and 5' }
    }

    // Get booking and verify guest
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: {
        listing: {
          include: { hostProfile: true }
        },
        review: true
      }
    })

    if (!booking) {
      return { error: 'Booking not found' }
    }

    if (booking.guestId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    if (booking.status !== 'COMPLETED') {
      return { error: 'Can only review completed bookings' }
    }

    if (booking.review) {
      return { error: 'Review already exists for this booking' }
    }

    const review = await prisma.review.create({
      data: {
        bookingId: data.bookingId,
        listingId: booking.listingId,
        reviewerId: session.user.id,
        hostProfileId: booking.listing.hostProfileId,
        rating: data.rating,
        comment: data.comment,
        communicationRating: data.communicationRating,
        experienceRating: data.experienceRating,
        valueRating: data.valueRating
      }
    })

    revalidatePath(`/listing/${booking.listing.slug}`)
    revalidatePath('/bookings')
    return { review }
  } catch (error) {
    console.error('Error creating review:', error)
    return { error: 'Failed to create review' }
  }
}

export async function getBookingForReview(bookingId: string) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          include: {
            hostProfile: true
          }
        },
        review: true
      }
    })

    if (!booking) {
      return { error: 'Booking not found' }
    }

    if (booking.guestId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    return { booking }
  } catch (error) {
    console.error('Error fetching booking:', error)
    return { error: 'Failed to fetch booking' }
  }
}
