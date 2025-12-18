'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Session } from '@/lib/types'

export async function getApplications(status?: string) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const userRole = session.user.role

  if (userRole !== 'MODERATOR' && userRole !== 'ADMIN') {
    return { error: 'Forbidden' }
  }

  try {
    const applications = await prisma.hostApplication.findMany({
      where: status
        ? {
            status: status as any
          }
        : {},
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    return { applications }
  } catch (error) {
    console.error('Error fetching applications:', error)
    return { error: 'Failed to fetch applications' }
  }
}

export async function approveApplication(
  applicationId: string,
  reviewNotes?: string
) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const userRole = session.user.role

  if (userRole !== 'MODERATOR' && userRole !== 'ADMIN') {
    return { error: 'Forbidden' }
  }

  try {
    const application = await prisma.hostApplication.update({
      where: { id: applicationId },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        reviewNotes
      },
      include: {
        user: true
      }
    })

    // Update user role to HOST
    await prisma.user.update({
      where: { id: application.userId },
      data: { role: 'HOST' }
    })

    // Send approval email
    try {
      const { sendHostApplicationStatusEmail } = await import('@/lib/email')
      await sendHostApplicationStatusEmail(
        application.user.email,
        'approved',
        reviewNotes
      )
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError)
    }

    revalidatePath('/mod/review/hosts')
    return { success: true }
  } catch (error) {
    console.error('Error approving application:', error)
    return { error: 'Failed to approve application' }
  }
}

export async function rejectApplication(
  applicationId: string,
  reviewNotes?: string
) {
  const session = (await auth()) as Session

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const userRole = session.user.role

  if (userRole !== 'MODERATOR' && userRole !== 'ADMIN') {
    return { error: 'Forbidden' }
  }

  try {
    await prisma.hostApplication.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        reviewNotes
      }
    })

    revalidatePath('/mod/review/hosts')
    return { success: true }
  } catch (error) {
    console.error('Error rejecting application:', error)
    return { error: 'Failed to reject application' }
  }
}
