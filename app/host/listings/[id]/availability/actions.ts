'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Session } from '@/lib/types'

export async function getListingAvailability(listingId: string) {
  try {
    const availability = await prisma.availability.findMany({
      where: { listingId },
      orderBy: { startTime: 'asc' }
    })

    return { availability }
  } catch (error) {
    console.error('Error fetching availability:', error)
    return { error: 'Failed to fetch availability' }
  }
}

export async function createAvailability(data: {
  listingId: string
  type: 'SPECIFIC_DATE' | 'RECURRING'
  startTime?: Date
  endTime?: Date
  recurring?: string
}) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    // Verify user owns the listing
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
      include: {
        hostProfile: true
      }
    })

    if (!listing) {
      return { error: 'Listing not found' }
    }

    if (listing.hostProfile.userId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    // Validate data based on type
    if (data.type === 'SPECIFIC_DATE' && (!data.startTime || !data.endTime)) {
      return { error: 'Start time and end time required for specific date' }
    }

    if (data.type === 'RECURRING' && !data.recurring) {
      return { error: 'Recurring pattern required for recurring availability' }
    }

    const availability = await prisma.availability.create({
      data: {
        listingId: data.listingId,
        type: data.type,
        startTime: data.startTime,
        endTime: data.endTime,
        recurring: data.recurring
      }
    })

    revalidatePath(`/host/listings/${data.listingId}/availability`)
    return { availability }
  } catch (error) {
    console.error('Error creating availability:', error)
    return { error: 'Failed to create availability' }
  }
}

export async function deleteAvailability(availabilityId: string) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    // Verify ownership
    const availability = await prisma.availability.findUnique({
      where: { id: availabilityId },
      include: {
        listing: {
          include: {
            hostProfile: true
          }
        }
      }
    })

    if (!availability) {
      return { error: 'Availability not found' }
    }

    if (availability.listing.hostProfile.userId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    await prisma.availability.delete({
      where: { id: availabilityId }
    })

    revalidatePath(`/host/listings/${availability.listingId}/availability`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting availability:', error)
    return { error: 'Failed to delete availability' }
  }
}

export async function checkAvailabilityConflict(
  listingId: string,
  startTime: Date,
  endTime: Date
) {
  try {
    // Check for existing bookings in this time range
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        listingId,
        status: {
          in: ['ACCEPTED', 'AUTHORIZED', 'COMPLETED']
        },
        OR: [
          {
            AND: [
              { scheduledStart: { lte: startTime } },
              { scheduledEnd: { gt: startTime } }
            ]
          },
          {
            AND: [
              { scheduledStart: { lt: endTime } },
              { scheduledEnd: { gte: endTime } }
            ]
          },
          {
            AND: [
              { scheduledStart: { gte: startTime } },
              { scheduledEnd: { lte: endTime } }
            ]
          }
        ]
      }
    })

    return {
      hasConflict: conflictingBookings.length > 0,
      conflictingBookings
    }
  } catch (error) {
    console.error('Error checking availability:', error)
    return { error: 'Failed to check availability' }
  }
}
