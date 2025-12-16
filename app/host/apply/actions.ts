'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveDraft(data: {
  businessName: string
  phone: string
  bio: string
  experienceYears: number
  cuisineTypes: string[]
  address: string
  city: string
  state: string
  zipCode: string
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    // Check if user already has a draft or submitted application
    const existing = await prisma.hostApplication.findFirst({
      where: {
        userId: session.user.id,
        status: {
          in: ['DRAFT', 'SUBMITTED']
        }
      }
    })

    if (existing) {
      // Update existing draft
      await prisma.hostApplication.update({
        where: { id: existing.id },
        data: {
          businessName: data.businessName,
          phone: data.phone,
          bio: data.bio,
          experienceYears: data.experienceYears,
          cuisineTypes: data.cuisineTypes,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new draft
      await prisma.hostApplication.create({
        data: {
          userId: session.user.id,
          businessName: data.businessName,
          phone: data.phone,
          bio: data.bio,
          experienceYears: data.experienceYears,
          cuisineTypes: data.cuisineTypes,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          status: 'DRAFT'
        }
      })
    }

    revalidatePath('/host/apply')
    return { success: true }
  } catch (error) {
    console.error('Error saving draft:', error)
    return { error: 'Failed to save draft' }
  }
}

export async function submitApplication(data: {
  businessName: string
  phone: string
  bio: string
  experienceYears: number
  cuisineTypes: string[]
  address: string
  city: string
  state: string
  zipCode: string
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    // Check if user already has a submitted application
    const existing = await prisma.hostApplication.findFirst({
      where: {
        userId: session.user.id,
        status: {
          in: ['DRAFT', 'SUBMITTED']
        }
      }
    })

    if (existing) {
      // Update and submit existing application
      await prisma.hostApplication.update({
        where: { id: existing.id },
        data: {
          businessName: data.businessName,
          phone: data.phone,
          bio: data.bio,
          experienceYears: data.experienceYears,
          cuisineTypes: data.cuisineTypes,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          status: 'SUBMITTED',
          submittedAt: new Date(),
          updatedAt: new Date()
        }
      })
    } else {
      // Create new application with submitted status
      await prisma.hostApplication.create({
        data: {
          userId: session.user.id,
          businessName: data.businessName,
          phone: data.phone,
          bio: data.bio,
          experienceYears: data.experienceYears,
          cuisineTypes: data.cuisineTypes,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          status: 'SUBMITTED',
          submittedAt: new Date()
        }
      })
    }

    revalidatePath('/host/apply')
    return { success: true }
  } catch (error) {
    console.error('Error submitting application:', error)
    return { error: 'Failed to submit application' }
  }
}

export async function getApplication() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  try {
    const application = await prisma.hostApplication.findFirst({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return application
  } catch (error) {
    console.error('Error fetching application:', error)
    return null
  }
}
