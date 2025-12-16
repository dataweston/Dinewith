import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createPlaidIdentitySession, plaidEnabled } from '@/lib/integrations/plaid'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { applicationId } = body

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }

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

    const plaidSession = await createPlaidIdentitySession(session.user.id)

    const updated = await prisma.hostApplication.update({
      where: { id: applicationId },
      data: {
        kycStatus: 'IN_PROGRESS',
        kycStartedAt: new Date(),
        kycData: JSON.stringify({
          provider: plaidSession.provider || (plaidEnabled ? 'plaid' : 'stub'),
          sessionId: plaidSession.sessionId,
          status: plaidEnabled ? 'started' : 'stub-started',
          timestamp: new Date().toISOString()
        })
      }
    })

    return NextResponse.json({
      success: true,
      kycStatus: updated.kycStatus,
      shareableUrl: plaidSession.shareableUrl,
      sessionId: plaidSession.sessionId,
      message: plaidEnabled
        ? 'KYC process initiated via Plaid'
        : 'Plaid not configured - using stubbed verification flow'
    })
  } catch (error) {
    console.error('Error starting KYC:', error)
    return NextResponse.json(
      { error: 'Failed to start KYC process' },
      { status: 500 }
    )
  }
}
