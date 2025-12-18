'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Session } from '@/lib/types'

export async function getHostEarnings() {
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

    // Get all completed bookings for this host
    const completedBookings = await prisma.booking.findMany({
      where: {
        listing: {
          hostProfileId: hostProfile.id
        },
        status: 'COMPLETED',
        capturedAt: { not: null }
      },
      include: {
        listing: {
          select: {
            title: true
          }
        },
        guest: {
          select: {
            name: true
          }
        }
      },
      orderBy: { capturedAt: 'desc' }
    })

    // Calculate total earnings (host amount from each booking)
    const totalEarnings = completedBookings.reduce(
      (sum, booking) => sum + booking.hostAmount,
      0
    )

    // Get all payouts
    const payouts = await prisma.payout.findMany({
      where: { hostProfileId: hostProfile.id },
      orderBy: { requestedAt: 'desc' }
    })

    const totalPaidOut = payouts
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, payout) => sum + payout.amount, 0)

    const pendingPayouts = payouts
      .filter(p => p.status === 'PENDING' || p.status === 'PROCESSING')
      .reduce((sum, payout) => sum + payout.amount, 0)

    const availableBalance = totalEarnings - totalPaidOut - pendingPayouts

    return {
      totalEarnings,
      totalPaidOut,
      pendingPayouts,
      availableBalance,
      completedBookings,
      payouts
    }
  } catch (error) {
    console.error('Error fetching host earnings:', error)
    return { error: 'Failed to fetch earnings' }
  }
}

export async function requestPayout(amount: number, notes?: string) {
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

    // Verify sufficient balance
    const earningsResult = await getHostEarnings()
    if ('error' in earningsResult) {
      return earningsResult
    }

    if (amount > earningsResult.availableBalance) {
      return { error: 'Insufficient balance' }
    }

    if (amount < 1000) {
      // Minimum $10
      return { error: 'Minimum payout amount is $10.00' }
    }

    const payout = await prisma.payout.create({
      data: {
        hostProfileId: hostProfile.id,
        amount,
        notes
      }
    })

    revalidatePath('/host/payouts')
    return { payout }
  } catch (error) {
    console.error('Error requesting payout:', error)
    return { error: 'Failed to request payout' }
  }
}

export async function getPayouts() {
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

    const payouts = await prisma.payout.findMany({
      where: { hostProfileId: hostProfile.id },
      orderBy: { requestedAt: 'desc' }
    })

    return { payouts }
  } catch (error) {
    console.error('Error fetching payouts:', error)
    return { error: 'Failed to fetch payouts' }
  }
}

// Admin action to process payouts
export async function processPayout(payoutId: string, transferId?: string) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  if (session.user.role !== 'ADMIN') {
    return { error: 'Forbidden' }
  }

  try {
    const payout = await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: 'COMPLETED',
        transferId,
        processedAt: new Date(),
        completedAt: new Date()
      }
    })

    revalidatePath('/admin/payouts')
    return { payout }
  } catch (error) {
    console.error('Error processing payout:', error)
    return { error: 'Failed to process payout' }
  }
}
