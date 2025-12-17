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
    const { reportedUserId, type, reason, description, listingId, streamId } = body

    if (!type || !reason) {
      return NextResponse.json(
        { error: 'type and reason are required' },
        { status: 400 }
      )
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        reportedUserId: reportedUserId || null,
        type,
        reason,
        description: description || '',
        listingId: listingId || null,
        streamId: streamId || null,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ success: true, reportId: report.id })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    )
  }
}
