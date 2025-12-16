import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getPlaidIdentityStatus, plaidEnabled } from '@/lib/integrations/plaid'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { applicationId, sessionId } = body

    if (!applicationId || !sessionId) {
      return NextResponse.json(
        { error: 'Application ID and session ID are required' },
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

    // Check Plaid verification status
    const plaidStatus = await getPlaidIdentityStatus(sessionId)

    const kycStatus = plaidStatus.status === 'success' ? 'COMPLETED' : 'FAILED'

    const updated = await prisma.hostApplication.update({
      where: { id: applicationId },
      data: {
        kycStatus,
        kycCompletedAt: new Date(),
        kycData: JSON.stringify({
          provider: plaidStatus.provider || (plaidEnabled ? 'plaid' : 'stub'),
          sessionId,
          status: plaidStatus.status,
          timestamp: new Date().toISOString(),
          details: plaidStatus
        })
      }
    })

    return NextResponse.json({
      success: true,
      kycStatus: updated.kycStatus,
      verificationDetails: plaidStatus
    })
  } catch (error) {
    console.error('Error completing KYC:', error)
    return NextResponse.json(
      { error: 'Failed to complete KYC process' },
      { status: 500 }
    )
  }
}
