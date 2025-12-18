'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Session } from '@/lib/types'

export async function getMyAvailability() {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        listings: {
          where: { status: { in: ['ACTIVE', 'PAUSED'] } },
          include: {
            availability: {
              orderBy: { startTime: 'asc' }
            }
          }
        }
      }
    })

    if (!hostProfile) {
      return { error: 'Host profile not found' }
    }

    return { listings: hostProfile.listings }
  } catch (error) {
    console.error('Error fetching availability:', error)
    return { error: 'Failed to fetch availability' }
  }
}

export async function addAvailability(data: {
  listingId: string
  startTime: Date
  endTime: Date
}) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    // Verify listing belongs to host
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
      include: { hostProfile: true }
    })

    if (!listing || listing.hostProfile.userId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    // Validate time range
    if (data.startTime >= data.endTime) {
      return { error: 'End time must be after start time' }
    }

    if (data.startTime < new Date()) {
      return { error: 'Cannot add availability in the past' }
    }

    // Check for overlapping availability
    const overlapping = await prisma.availability.findFirst({
      where: {
        listingId: data.listingId,
        type: 'SPECIFIC_DATE',
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: data.endTime } },
              { endTime: { gte: data.endTime } }
            ]
          }
        ]
      }
    })

    if (overlapping) {
      return { error: 'Overlapping availability slot exists' }
    }

    const availability = await prisma.availability.create({
      data: {
        listingId: data.listingId,
        type: 'SPECIFIC_DATE',
        startTime: data.startTime,
        endTime: data.endTime
      }
    })

    revalidatePath('/host/availability')
    return { availability }
  } catch (error) {
    console.error('Error adding availability:', error)
    return { error: 'Failed to add availability' }
  }
}

export async function removeAvailability(availabilityId: string) {
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
          include: { hostProfile: true }
        }
      }
    })

    if (!availability || availability.listing.hostProfile.userId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    if (availability.isBooked) {
      return { error: 'Cannot remove booked time slot' }
    }

    await prisma.availability.delete({
      where: { id: availabilityId }
    })

    revalidatePath('/host/availability')
    return { success: true }
  } catch (error) {
    console.error('Error removing availability:', error)
    return { error: 'Failed to remove availability' }
  }
}

export async function bulkAddAvailability(data: {
  listingId: string
  dates: { startTime: Date; endTime: Date }[]
}) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    // Verify listing belongs to host
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
      include: { hostProfile: true }
    })

    if (!listing || listing.hostProfile.userId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    const created = await prisma.availability.createMany({
      data: data.dates.map(slot => ({
        listingId: data.listingId,
        type: 'SPECIFIC_DATE' as const,
        startTime: slot.startTime,
        endTime: slot.endTime
      })),
      skipDuplicates: true
    })

    revalidatePath('/host/availability')
    return { count: created.count }
  } catch (error) {
    console.error('Error bulk adding availability:', error)
    return { error: 'Failed to add availability slots' }
  }
}
