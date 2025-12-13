import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { IconArrowRight, IconUtensils } from '@/components/ui/icons'

import { WaitlistForm } from './waitlist-form'

const getCity = cache(async (stateSlug: string, citySlug: string) => {
  return prisma.city.findFirst({
    where: {
      stateSlug,
      slug: citySlug
    },
    include: {
      _count: {
        select: { waitlistEntries: true }
      }
    }
  })
})

type PageParams = {
  params: {
    state: string
    city: string
  }
}

type Highlight = {
  title: string
  detail: string
}

type CityRoute = {
  title: string
  tagline: string
  stops: { title: string; detail: string }[]
}

const cityHighlights: Record<string, Highlight[]> = {
  'minneapolis-st-paul': [
    {
      title: 'Warehouse warmth',
      detail: 'Converted North Loop lofts with cedar smoke, vinyl, and candlelight.'
    },
    {
      title: 'River mixers',
      detail: 'Amuse-bouche ferries on the Mississippi before coursed dinners begin.'
    },
    {
      title: 'Craft + comfort',
      detail: 'Pairing Lowertown ceramics with Nordic snacks and Midwest spirits.'
    }
  ],
  chicago: [
    {
      title: 'Skyline progressions',
      detail: 'Fulton Market terraces with open-fire cooking and skyline sightlines.'
    },
    {
      title: 'Listening-room desserts',
      detail: 'South Loop lofts close the night with pastry, vinyl, and natural wine.'
    },
    {
      title: 'Producers in the room',
      detail: 'Farmers, founders, and chefs table-hopping between courses.'
    }
  ],
  madison: [
    {
      title: 'Lake house labs',
      detail: 'Mendota-facing labs where fermentation jars sit next to live-fire grills.'
    },
    {
      title: 'Market run-ins',
      detail: 'Square-side aperitivos with nearby cheesemakers, distillers, and bakers.'
    },
    {
      title: 'Late-night potlucks',
      detail: 'Williamson Street brownstones keep dessert casual but unforgettable.'
    }
  ]
}

const cityRoutes: Record<string, CityRoute> = {
  'minneapolis-st-paul': {
    title: 'Riverfront progression',
    tagline: 'A winter-proof flow that connects Saint Paul creatives with Minneapolis kitchens.',
    stops: [
      {
        title: 'Gallery mise en place',
        detail: 'Warm glogg, cedar chips, and artist talkbacks in a Lowertown loft.'
      },
      {
        title: 'North Loop service',
        detail: 'Seven playful courses with brewery pairings and communal tables.'
      },
      {
        title: 'After-hours greenhouse',
        detail: 'Digestifs under grow lights while guest DJs keep things unbuttoned.'
      }
    ]
  },
  chicago: {
    title: 'Three neighborhoods, one table',
    tagline: 'Move through the city the way chefs do: quick, purposeful, and bold.',
    stops: [
      {
        title: 'Fulton Market test kitchen',
        detail: 'Spritz service and bite-sized introductions around an open hearth.'
      },
      {
        title: 'Pilsen listening loft',
        detail: 'Family-style pasta, natural wine, and curated conversation prompts.'
      },
      {
        title: 'Gold Coast digestif cart',
        detail: 'Small sweets, skyline views, and a surprise collaborator drop-in.'
      }
    ]
  },
  madison: {
    title: 'Capital square to the lake',
    tagline: 'A progressive dinner that keeps the Madison creative loop intact.',
    stops: [
      {
        title: 'Market aperitivos',
        detail: 'Bubbly pours and produce previews as the sun drops behind the capitol.'
      },
      {
        title: 'Lakefront tasting',
        detail: 'Chef-led stories from Driftless farms, matched with intentional seating.'
      },
      {
        title: 'Williamson street nightcap',
        detail: 'Vinyl, bonfires, and old-fashioneds for the ones still scheming.'
      }
    ]
  }
}

const cityNeighborhoods: Record<string, string> = {
  'minneapolis-st-paul': 'North Loop / Lowertown / Northeast',
  chicago: 'Fulton Market / Pilsen / Gold Coast',
  madison: 'Capitol Square / Tenney Locks / Willy Street'
}

const citySeasonalFocus: Record<string, string> = {
  'minneapolis-st-paul': 'Winter greenhouse collabs',
  chicago: 'Hearth + skyline residencies',
  madison: 'Lake Mendota fermentations'
}

const defaultHighlights = (cityName: string): Highlight[] => [
  {
    title: 'Chef collaborations',
    detail: `${cityName} pop-ups featuring resident chefs plus traveling friends.`
  },
  {
    title: 'Better tables',
    detail: 'Curated guest lists that pair hosts, founders, and creatives intentionally.'
  },
  {
    title: 'Flexible formats',
    detail: 'Tasting menus, ateliers, and living-room suppers depending on the night.'
  }
]

const fallbackRoute = (cityName: { name: string; stateCode: string }): CityRoute => ({
  title: `${cityName.name} pilot flow`,
  tagline: `How we are prototyping Dinewith nights across ${cityName.name}, ${cityName.stateCode}.`,
  stops: [
    {
      title: 'Arrival drinks',
      detail: 'Meet the hosts, shake off the day, and learn the night\'s theme.'
    },
    {
      title: 'Anchored courses',
      detail: 'Two to four courses that showcase local producers and collaborators.'
    },
    {
      title: 'Open final chapter',
      detail: 'Unhurried desserts, vinyl, and new groups formed around the fire.'
    }
  ]
})

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value)

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const stateSlug = params.state.toLowerCase()
  const citySlug = params.city.toLowerCase()
  const city = await getCity(stateSlug, citySlug)

  if (!city) {
    return {
      title: 'Dinewith city waitlist',
      description: 'Reserve a spot at upcoming Dinewith tables across the U.S.'
    }
  }

  const description =
    city.description ||
    city.heroCopy ||
    `Join the Dinewith waitlist in ${city.name}, ${city.stateCode}.`

  return {
    title: `${city.name} - Dinewith`,
    description,
    alternates: {
      canonical: `/us/${city.stateSlug}/${city.slug}`
    },
    openGraph: {
      title: `${city.name} - Dinewith`,
      description,
      url: `/us/${city.stateSlug}/${city.slug}`
    }
  }
}

export default async function CityLandingPage({ params }: PageParams) {
  const stateSlug = params.state.toLowerCase()
  const citySlug = params.city.toLowerCase()
  const city = await getCity(stateSlug, citySlug)

  if (!city) {
    notFound()
  }

  const highlights = cityHighlights[city.slug] ?? defaultHighlights(city.name)
  const route = cityRoutes[city.slug] ?? fallbackRoute(city)
  const waitlistCount = city._count.waitlistEntries
  const neighborhoods = cityNeighborhoods[city.slug] ?? 'Handpicked venues'
  const seasonalFocus = citySeasonalFocus[city.slug] ?? 'Chef collaborations'

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-0">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-background px-6 py-12 sm:px-10">
        <div className="absolute inset-0 -z-10 opacity-60 blur-3xl" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_55%)]" />
        </div>
        <div className="grid gap-10 lg:grid-cols-[1.35fr,1fr]">
          <div className="space-y-6">
            <Badge variant="secondary" className="w-fit">{city.stateName} beta waitlist</Badge>
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconUtensils className="size-5 text-primary" />
              <span className="text-sm uppercase tracking-[0.2em]">US / {city.stateCode}</span>
            </div>
            <div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
                Dinewith {city.name}
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                {city.headline ||
                  city.description ||
                  `Pilot dinners that mix ${city.name} makers, chefs, and generous hosts.`}
              </p>
            </div>
            <dl className="grid gap-4 sm:grid-cols-3">
              <Stat
                label="Current waitlist"
                value={waitlistCount ? `${formatNumber(waitlistCount)}+` : 'First seats'}
              />
              <Stat label="Neighborhood focus" value={neighborhoods} />
              <Stat label="Seasonal direction" value={seasonalFocus} />
            </dl>
          </div>
          <div className="rounded-3xl border bg-background/80 p-6 shadow-lg shadow-primary/10">
            <div className="space-y-2 text-center">
              <p className="text-sm uppercase tracking-wide text-muted-foreground">Join the table</p>
              <p className="text-lg font-medium">Drop your details and we will confirm pilot dates.</p>
            </div>
            <div className="mt-6">
              <WaitlistForm citySlug={city.slug} cityName={city.name} />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Why this market</p>
            <h2 className="text-2xl font-semibold">What we are building in {city.name}</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map(highlight => (
            <article key={highlight.title} className="rounded-2xl border bg-card/70 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{highlight.title}</p>
              <p className="mt-3 text-base text-foreground">{highlight.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border bg-background/80 px-6 py-10 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr,1fr]">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Sample flow</p>
            <h2 className="text-3xl font-semibold text-foreground">{route.title}</h2>
            <p className="text-base text-muted-foreground">{route.tagline}</p>
          </div>
          <div className="space-y-4">
            {route.stops.map((stop, index) => (
              <div key={stop.title} className="rounded-2xl border bg-card/80 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  <span>Stage {index + 1}</span>
                  <IconArrowRight className="size-4" />
                </div>
                <p className="mt-3 text-lg font-medium text-foreground">{stop.title}</p>
                <p className="text-sm text-muted-foreground">{stop.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card/80 p-4 text-sm">
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}
