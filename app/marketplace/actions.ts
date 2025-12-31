'use server'

import { prisma } from '@/lib/prisma'

export async function getActiveListings(filters?: {
  type?: string
  city?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'recommended' | 'price-low' | 'price-high' | 'rating'
}) {
  try {
    const where: any = {
      status: 'ACTIVE'
    }

    if (filters?.type) {
      where.type = filters.type
    }

    if (filters?.city) {
      where.city = {
        contains: filters.city,
        mode: 'insensitive'
      }
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
        { hostProfile: { displayName: { contains: filters.search, mode: 'insensitive' } } }
      ]
    }

    if (filters?.minPrice !== undefined) {
      where.priceAmount = { ...where.priceAmount, gte: filters.minPrice }
    }

    if (filters?.maxPrice !== undefined) {
      where.priceAmount = { ...where.priceAmount, lte: filters.maxPrice }
    }

    // Determine sort order
    let orderBy: any = [
      { publishedAt: 'desc' },
      { createdAt: 'desc' }
    ]

    if (filters?.sort === 'price-low') {
      orderBy = { priceAmount: 'asc' }
    } else if (filters?.sort === 'price-high') {
      orderBy = { priceAmount: 'desc' }
    } else if (filters?.sort === 'rating') {
      orderBy = [
        { bookingCount: 'desc' },
        { viewCount: 'desc' }
      ]
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        hostProfile: {
          select: {
            displayName: true,
            avatar: true,
            bio: true,
            tagline: true,
            cuisines: true
          }
        }
      },
      orderBy
    })

    return { listings }
  } catch (error) {
    console.error('Error fetching listings:', error)
    return { error: 'Failed to fetch listings' }
  }
}

export async function getListingBySlug(slug: string) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { slug },
      include: {
        hostProfile: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        availability: {
          where: {
            isBooked: false,
            startTime: {
              gte: new Date()
            }
          },
          orderBy: {
            startTime: 'asc'
          },
          take: 10
        }
      }
    })

    if (!listing) {
      return { error: 'Listing not found' }
    }

    // Increment view count
    await prisma.listing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } }
    })

    return { listing }
  } catch (error) {
    console.error('Error fetching listing:', error)
    return { error: 'Failed to fetch listing' }
  }
}
