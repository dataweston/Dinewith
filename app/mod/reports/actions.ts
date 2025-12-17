'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function handleReport(formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  if (session.user.role !== 'MODERATOR' && session.user.role !== 'ADMIN') {
    throw new Error('Forbidden')
  }

  const reportId = formData.get('reportId') as string
  const action = formData.get('action') as string

  if (!reportId || !action) {
    throw new Error('Missing required fields')
  }

  if (action === 'approve') {
    // Update report status to RESOLVED
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'RESOLVED',
        reviewedBy: session.user.id,
        reviewedAt: new Date()
      }
    })

    // TODO: Take actual moderation action (suspend user, remove content, etc.)
  } else if (action === 'dismiss') {
    // Update report status to DISMISSED
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'DISMISSED',
        reviewedBy: session.user.id,
        reviewedAt: new Date()
      }
    })
  }

  revalidatePath('/mod/reports')
  redirect('/mod/reports')
}
