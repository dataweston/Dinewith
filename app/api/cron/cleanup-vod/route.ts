import { prisma } from '@/lib/prisma'
import { deleteStream as deleteLivepeerStream } from '@/lib/integrations/livepeer'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Verify cron secret (set in Vercel environment)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // Find expired streams
    const expiredStreams = await prisma.stream.findMany({
      where: {
        vodExpiresAt: {
          lte: now
        },
        status: 'ENDED',
        vodDeletedAt: null
      }
    })

    const results = []

    for (const stream of expiredStreams) {
      try {
        // Delete from Livepeer if it exists
        if (stream.livepeerStreamId) {
          await deleteLivepeerStream(stream.livepeerStreamId)
        }

        // Update database to mark as deleted
        await prisma.stream.update({
          where: { id: stream.id },
          data: { vodDeletedAt: now }
        })

        results.push({ id: stream.id, status: 'deleted' })
      } catch (error) {
        console.error(`Error cleaning up stream ${stream.id}:`, error)
        results.push({ id: stream.id, status: 'error' })
      }
    }

    return NextResponse.json({
      success: true,
      cleaned: results.length,
      results
    })
  } catch (error) {
    console.error('VOD cleanup error:', error)
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    )
  }
}
