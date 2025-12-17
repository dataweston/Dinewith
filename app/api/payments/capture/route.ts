import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { captureBraintreePayment } from '@/lib/integrations/braintree'
import { captureSquarePayment } from '@/lib/integrations/square'

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

    if (!booking.paymentIntentId) {
      return NextResponse.json(
        { error: 'No payment authorization found' },
        { status: 400 }
      )
    }

    // Get the FeeTransaction to determine processor
    const feeTransaction = await prisma.feeTransaction.findFirst({
      where: { bookingId: booking.id }
    })

    const processor = feeTransaction?.processor || 'braintree'
    
    // Capture payment from processor
    let captureResult
    try {
      if (processor === 'braintree') {
        captureResult = await captureBraintreePayment(booking.paymentIntentId)
      } else {
        captureResult = await captureSquarePayment(booking.paymentIntentId)
      }
    } catch (error) {
      console.error('Payment capture failed:', error)
      return NextResponse.json(
        { error: 'Failed to capture payment from processor' },
        { status: 500 }
      )
    }

    // Update booking status
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'COMPLETED',
        capturedAt: new Date()
      }
    })

    // Update FeeTransaction status
    if (feeTransaction) {
      await prisma.feeTransaction.update({
        where: { id: feeTransaction.id },
        data: { 
          processed: true,
          processedAt: new Date()
        }
      })
    }

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
      captureId: 'transactionId' in captureResult 
        ? captureResult.transactionId 
        : captureResult.paymentId,
      processor
    })
  } catch (error) {
    console.error('Error capturing payment:', error)
    return NextResponse.json(
      { error: 'Failed to capture payment' },
      { status: 500 }
    )
  }
}
