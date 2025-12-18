'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Session } from '@/lib/types'

export async function getSubmittedListings(status?: string) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const userRole = session.user.role

  if (userRole !== 'MODERATOR' && userRole !== 'ADMIN') {
    return { error: 'Forbidden' }
  }

  try {
    const listings = await prisma.listing.findMany({
      where: status
        ? { status: status as any }
        : {
            status: {
              in: ['SUBMITTED', 'ACTIVE', 'REJECTED', 'PAUSED']
            }
          },
      include: {
        hostProfile: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return { listings }
  } catch (error) {
    console.error('Error fetching listings:', error)
    return { error: 'Failed to fetch listings' }
  }
}

export async function approveListing(listingId: string) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const userRole = session.user.role

  if (userRole !== 'MODERATOR' && userRole !== 'ADMIN') {
    return { error: 'Forbidden' }
  }

  try {
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: 'ACTIVE',
        publishedAt: new Date()
      }
    })

    revalidatePath('/mod/review/listings')
    return { success: true }
  } catch (error) {
    console.error('Error approving listing:', error)
    return { error: 'Failed to approve listing' }
  }
}

export async function rejectListing(listingId: string, reason?: string) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const userRole = session.user.role

  if (userRole !== 'MODERATOR' && userRole !== 'ADMIN') {
    return { error: 'Forbidden' }
  }

  try {
    // Note: We'd ideally add a rejectionReason field to the Listing model
    // For now, we'll just update the status
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: 'REJECTED'
      }
    })

    revalidatePath('/mod/review/listings')
    return { success: true }
  } catch (error) {
    console.error('Error rejecting listing:', error)
    return { error: 'Failed to reject listing' }
  }
}
