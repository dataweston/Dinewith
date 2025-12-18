'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Session } from '@/lib/types'

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
    // Verify booking belongs to user and is completed
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

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      return { error: 'Rating must be between 1 and 5' }
    }

    const review = await prisma.review.create({
      data: {
        bookingId: data.bookingId,
        listingId: booking.listingId,
        reviewerId: session.user.id,
        hostProfileId: booking.listing.hostProfile.id,
        rating: data.rating,
        comment: data.comment,
        communicationRating: data.communicationRating,
        experienceRating: data.experienceRating,
        valueRating: data.valueRating
      }
    })

    revalidatePath(`/listing/${booking.listing.slug}`)
    return { review }
  } catch (error) {
    console.error('Error creating review:', error)
    return { error: 'Failed to create review' }
  }
}

export async function getListingReviews(listingId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        listingId,
        isPublished: true
      },
      include: {
        booking: {
          include: {
            guest: {
              select: {
                name: true,
                id: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    return { reviews, avgRating, count: reviews.length }
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return { error: 'Failed to fetch reviews' }
  }
}

export async function getHostProfileReviews(hostProfileId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        hostProfileId,
        isPublished: true
      },
      include: {
        listing: {
          select: {
            title: true,
            slug: true
          }
        },
        booking: {
          include: {
            guest: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    return { reviews, avgRating, count: reviews.length }
  } catch (error) {
    console.error('Error fetching host reviews:', error)
    return { error: 'Failed to fetch reviews' }
  }
}

export async function canReviewBooking(bookingId: string) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { canReview: false, reason: 'Not authenticated' }
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true }
    })

    if (!booking) {
      return { canReview: false, reason: 'Booking not found' }
    }

    if (booking.guestId !== session.user.id) {
      return { canReview: false, reason: 'Not your booking' }
    }

    if (booking.status !== 'COMPLETED') {
      return { canReview: false, reason: 'Booking not completed' }
    }

    if (booking.review) {
      return { canReview: false, reason: 'Already reviewed' }
    }

    return { canReview: true }
  } catch (error) {
    console.error('Error checking review eligibility:', error)
    return { canReview: false, reason: 'Error checking eligibility' }
  }
}
