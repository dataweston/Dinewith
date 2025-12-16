'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Session } from '@/lib/types'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Math.random().toString(36).substring(2, 8)
}

export async function getOrCreateHostProfile() {
  const session = (await auth()) as Session
  
  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }
  
  if (session.user.role !== 'HOST' && session.user.role !== 'ADMIN') {
    return { error: 'Must be approved as a host first' }
  }
  
  try {
    let profile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id }
    })
    
    if (!profile) {
      // Create default profile
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })
      
      profile = await prisma.hostProfile.create({
        data: {
          userId: session.user.id,
          displayName: user?.name || 'Host',
          isActive: true
        }
      })
    }
    
    return { profile }
  } catch (error) {
    console.error('Error getting host profile:', error)
    return { error: 'Failed to get host profile' }
  }
}

export async function createListing(data: {
  title: string
  type: string
  priceAmount: number
  duration?: number
  maxGuests: number
  content: string
  city?: string
  state?: string
}) {
  const session = (await auth()) as Session
  
  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }
  
  try {
    // Get or create host profile
    const profileResult = await getOrCreateHostProfile()
    if ('error' in profileResult) {
      return profileResult
    }
    
    const { profile } = profileResult
    
    const listing = await prisma.listing.create({
      data: {
        hostProfileId: profile.id,
        title: data.title,
        slug: generateSlug(data.title),
        type: data.type as any,
        priceAmount: data.priceAmount,
        priceCurrency: 'USD',
        duration: data.duration,
        maxGuests: data.maxGuests,
        content: data.content,
        city: data.city,
        state: data.state,
        status: 'DRAFT'
      }
    })
    
    revalidatePath('/host/listings')
    return { listing }
  } catch (error) {
    console.error('Error creating listing:', error)
    return { error: 'Failed to create listing' }
  }
}

export async function updateListing(listingId: string, data: {
  title?: string
  type?: string
  priceAmount?: number
  duration?: number
  maxGuests?: number
  content?: string
  city?: string
  state?: string
  status?: string
}) {
  const session = (await auth()) as Session
  
  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }
  
  try {
    // Verify ownership
    const existing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { hostProfile: true }
    })
    
    if (!existing || existing.hostProfile.userId !== session.user.id) {
      return { error: 'Listing not found or unauthorized' }
    }
    
    const updateData: any = {}
    if (data.title) {
      updateData.title = data.title
      updateData.slug = generateSlug(data.title)
    }
    if (data.type) updateData.type = data.type
    if (data.priceAmount !== undefined) updateData.priceAmount = data.priceAmount
    if (data.duration !== undefined) updateData.duration = data.duration
    if (data.maxGuests !== undefined) updateData.maxGuests = data.maxGuests
    if (data.content) updateData.content = data.content
    if (data.city !== undefined) updateData.city = data.city
    if (data.state !== undefined) updateData.state = data.state
    if (data.status) updateData.status = data.status
    
    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: updateData
    })
    
    revalidatePath('/host/listings')
    revalidatePath(`/listing/${listing.slug}`)
    return { listing }
  } catch (error) {
    console.error('Error updating listing:', error)
    return { error: 'Failed to update listing' }
  }
}

export async function deleteListing(listingId: string) {
  const session = (await auth()) as Session
  
  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }
  
  try {
    // Verify ownership
    const existing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { hostProfile: true }
    })
    
    if (!existing || existing.hostProfile.userId !== session.user.id) {
      return { error: 'Listing not found or unauthorized' }
    }
    
    await prisma.listing.delete({
      where: { id: listingId }
    })
    
    revalidatePath('/host/listings')
    return { success: true }
  } catch (error) {
    console.error('Error deleting listing:', error)
    return { error: 'Failed to delete listing' }
  }
}

export async function getMyListings() {
  const session = (await auth()) as Session
  
  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }
  
  try {
    const profile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        listings: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    
    return { listings: profile?.listings || [] }
  } catch (error) {
    console.error('Error fetching listings:', error)
    return { error: 'Failed to fetch listings' }
  }
}

export async function submitListingForReview(listingId: string) {
  return updateListing(listingId, { status: 'SUBMITTED' })
}

export async function publishListing(listingId: string) {
  const result = await updateListing(listingId, { status: 'ACTIVE' })
  if ('listing' in result) {
    await prisma.listing.update({
      where: { id: listingId },
      data: { publishedAt: new Date() }
    })
  }
  return result
}

export async function pauseListing(listingId: string) {
  return updateListing(listingId, { status: 'PAUSED' })
}
