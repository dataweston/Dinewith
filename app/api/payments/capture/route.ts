import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Verify booking (host can capture after service is completed)
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId
      },
      include: {
        listing: {
          include: {
            hostProfile: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Either host or admin can capture
    const isHost = booking.listing.hostProfile.userId === session.user.id
    const isAdmin = (session.user as any).role === 'ADMIN'

    if (!isHost && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (booking.status !== 'AUTHORIZED') {
      return NextResponse.json(
        { error: 'Payment must be authorized first' },
        { status: 400 }
      )
    }

    // TODO: Integrate with real payment processor to capture funds
    // For now, just update status

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'COMPLETED',
        capturedAt: new Date()
      }
    })

    // Increment booking count on listing
    await prisma.listing.update({
      where: { id: booking.listingId },
      data: {
        bookingCount: { increment: 1 }
      }
    })

    return NextResponse.json({
      success: true,
      booking: updated,
      message: 'Payment captured (stub implementation)'
    })
  } catch (error) {
    console.error('Error capturing payment:', error)
    return NextResponse.json(
      { error: 'Failed to capture payment' },
      { status: 500 }
    )
  }
}
