/**
 * VOD Cleanup Script
 * Run this as a cron job daily to clean up expired VODs.
 * Vercel Cron: Add to vercel.json or use Vercel Cron Jobs feature.
 */

import { PrismaClient } from '@prisma/client'
import { deleteStream as deleteLivepeerStream } from '@/lib/integrations/livepeer'

const prisma = new PrismaClient()

async function cleanupExpiredVODs() {
  console.log('[VOD Cleanup] Starting cleanup job...')

  try {
    const now = new Date()

    // Find expired streams
    const expiredStreams = await prisma.stream.findMany({
      where: {
        vodExpiresAt: {
          lte: now
        },
        status: 'ENDED'
      }
    })

    console.log(`[VOD Cleanup] Found ${expiredStreams.length} expired streams`)

    for (const stream of expiredStreams) {
      try {
        // Delete from Livepeer if it exists
        if (stream.livepeerStreamId) {
          await deleteLivepeerStream(stream.livepeerStreamId)
          console.log(`[VOD Cleanup] Deleted Livepeer stream: ${stream.livepeerStreamId}`)
        }

        // Update database to mark as deleted
        await prisma.stream.update({
          where: { id: stream.id },
          data: { vodDeletedAt: new Date() }
        })

        console.log(`[VOD Cleanup] Marked stream ${stream.id} as deleted`)
      } catch (error) {
        console.error(`[VOD Cleanup] Error cleaning up stream ${stream.id}:`, error)
      }
    }

    console.log('[VOD Cleanup] Cleanup job completed')
  } catch (error) {
    console.error('[VOD Cleanup] Fatal error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  cleanupExpiredVODs()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

export { cleanupExpiredVODs }
