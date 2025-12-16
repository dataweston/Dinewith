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

    // Verify booking belongs to user
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        guestId: session.user.id
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Booking must be accepted first' },
        { status: 400 }
      )
    }

    // TODO: Integrate with real payment processor (Stripe, etc.)
    // For now, create a stub authorization
    const paymentIntentId = `stub_pi_${Math.random().toString(36).substring(2)}`

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'AUTHORIZED',
        paymentIntentId,
        authorizedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      booking: updated,
      paymentIntentId,
      message: 'Payment authorized (stub implementation)'
    })
  } catch (error) {
    console.error('Error authorizing payment:', error)
    return NextResponse.json(
      { error: 'Failed to authorize payment' },
      { status: 500 }
    )
  }
}
