import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { waitlistSchema } from '@/lib/validations/waitlist'

export async function POST(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const parsed = waitlistSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid waitlist submission',
        issues: parsed.error.flatten().fieldErrors
      },
      { status: 422 }
    )
  }

  const data = parsed.data
  const fallbackSource = 'city-landing'

  const city = await prisma.city.findUnique({
    where: { slug: data.citySlug }
  })

  if (!city) {
    return NextResponse.json({ error: 'City not found' }, { status: 404 })
  }

  try {
    const entry = await prisma.waitlistEntry.upsert({
      where: {
        email_cityId: {
          email: data.email,
          cityId: city.id
        }
      },
      update: {
        name: data.name,
        guests: data.guests,
        notes: data.notes,
        source: data.source ?? fallbackSource
      },
      create: {
        email: data.email,
        name: data.name,
        guests: data.guests,
        notes: data.notes,
        cityId: city.id,
        source: data.source ?? fallbackSource,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      ok: true,
      message: 'Added to the Dinewith waitlist',
      entry: {
        id: entry.id,
        city: city.slug,
        email: entry.email
      }
    })
  } catch (error) {
    console.error('[waitlist-post] Failed creating entry', error)
    return NextResponse.json({ error: 'Unable to save waitlist entry' }, { status: 500 })
  }
}
