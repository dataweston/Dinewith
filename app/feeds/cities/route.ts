import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export const revalidate = 300

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      orderBy: [{ stateName: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { waitlistEntries: true }
        }
      }
    })

    const payload = cities.map(city => ({
      slug: city.slug,
      name: city.name,
      stateName: city.stateName,
      stateSlug: city.stateSlug,
      stateCode: city.stateCode,
      headline: city.headline,
      description: city.description,
      heroCopy: city.heroCopy,
      heroImage: city.heroImage,
      waitlistCount: city._count.waitlistEntries,
      landingPath: `/us/${city.stateSlug}/${city.slug}`
    }))

    return NextResponse.json({ cities: payload })
  } catch (error) {
    console.error('[feeds/cities] Failed to fetch cities', error)
    return NextResponse.json({ error: 'Unable to load cities feed' }, { status: 500 })
  }
}
