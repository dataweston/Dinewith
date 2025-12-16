import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { authorizeBraintreePayment } from '@/lib/integrations/braintree'
import { authorizeSquarePayment } from '@/lib/integrations/square'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, paymentMethodNonce, processor = 'braintree' } = body

    if (!bookingId || !paymentMethodNonce) {
      return NextResponse.json(
        { error: 'Booking ID and payment method are required' },
        { status: 400 }
      )
    }

    // Verify booking belongs to user
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        guestId: session.user.id
      },
      include: {
        listing: {
          include: {
            host: true
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

    if (booking.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Booking must be accepted first' },
        { status: 400 }
      )
    }

    // Calculate amounts (booking.amount already includes 4% platform fee)
    const totalCents = Math.round(booking.amount * 100)
    const platformFeeCents = Math.round(booking.platformFee * 100)
    const hostPayoutCents = totalCents - platformFeeCents

    let paymentResult
    let processorUsed = processor

    try {
      if (processor === 'braintree') {
        paymentResult = await authorizeBraintreePayment({
          amount: totalCents,
          paymentMethodNonce,
          customerId: session.user.id
        })
      } else {
        throw new Error('Primary processor unavailable')
      }
    } catch (primaryError) {
      console.warn('Primary processor failed, trying Square fallback:', primaryError)
      processorUsed = 'square'
      
      paymentResult = await authorizeSquarePayment({
        amount: totalCents,
        sourceId: paymentMethodNonce,
        idempotencyKey: `${bookingId}-auth-${Date.now()}`,
        customerId: session.user.id
      })
    }

    // Create FeeTransaction record for platform fee
    const feeTransaction = await prisma.feeTransaction.create({
      data: {
        bookingId: booking.id,
        amount: booking.platformFee,
        status: 'PENDING',
        processor: processorUsed,
        transactionId: paymentResult.paymentId || paymentResult.transactionId
      }
    })

    // Update booking with authorization details
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'AUTHORIZED',
        paymentIntentId: paymentResult.paymentId || paymentResult.transactionId,
        authorizedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      booking: updated,
      paymentIntentId: paymentResult.paymentId || paymentResult.transactionId,
      processor: processorUsed,
      feeTransactionId: feeTransaction.id
    })
  } catch (error) {
    console.error('Error authorizing payment:', error)
    return NextResponse.json(
      { error: 'Failed to authorize payment' },
      { status: 500 }
    )
  }
}
