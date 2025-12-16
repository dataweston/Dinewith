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
    const { applicationId } = body

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

    // TODO: Integrate with Plaid or other KYC provider
    // For now, just update the status to IN_PROGRESS
    const updated = await prisma.hostApplication.update({
      where: { id: applicationId },
      data: {
        kycStatus: 'IN_PROGRESS',
        kycStartedAt: new Date(),
        kycData: JSON.stringify({
          provider: 'plaid',
          status: 'started',
          timestamp: new Date().toISOString()
        })
      }
    })

    return NextResponse.json({
      success: true,
      kycStatus: updated.kycStatus,
      // In a real implementation, return a link or session token
      kycLink: 'https://example.com/kyc-placeholder',
      message: 'KYC process initiated (stub implementation)'
    })
  } catch (error) {
    console.error('Error starting KYC:', error)
    return NextResponse.json(
      { error: 'Failed to start KYC process' },
      { status: 500 }
    )
  }
}
