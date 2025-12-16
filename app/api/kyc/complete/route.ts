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
    const { applicationId, success = true, data = {} } = body

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }

    // Verify the application belongs to the user
    const application = await prisma.hostApplication.findFirst({
      where: {
        id: applicationId,
        userId: session.user.id
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // TODO: Integrate with Plaid webhook or callback handler
    // For now, accept the success parameter and update status
    const kycStatus = success ? 'COMPLETED' : 'FAILED'

    const updated = await prisma.hostApplication.update({
      where: { id: applicationId },
      data: {
        kycStatus,
        kycCompletedAt: new Date(),
        kycData: JSON.stringify({
          provider: 'plaid',
          status: kycStatus.toLowerCase(),
          timestamp: new Date().toISOString(),
          ...data
        })
      }
    })

    return NextResponse.json({
      success: true,
      kycStatus: updated.kycStatus,
      message: `KYC process ${kycStatus.toLowerCase()} (stub implementation)`
    })
  } catch (error) {
    console.error('Error completing KYC:', error)
    return NextResponse.json(
      { error: 'Failed to complete KYC process' },
      { status: 500 }
    )
  }
}
