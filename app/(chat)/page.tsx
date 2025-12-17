import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { IconArrowRight } from '@/components/ui/icons'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Dinewith - Shared meals, shared moments',
  description: 'A people-centered marketplace connecting you with dining companionship and live meal experiences.'
}

export default async function HomePage() {
  // Get launch cities
  const cities = await prisma.city.findMany({
    where: {
      slug: {
        in: ['minneapolis-st-paul', 'chicago', 'madison']
      }
    },
    include: {
      _count: {
        select: { waitlistEntries: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  // Get sample active listings
  const listings = await prisma.listing.findMany({
    where: { status: 'ACTIVE' },
    include: {
      hostProfile: {
        select: { displayName: true }
      }
    },
    take: 3,
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 py-20 sm:py-32">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-6">Beta • Minneapolis, Chicago, Madison</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              Shared meals,<br />shared moments
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Dinewith connects people through dining companionship. 
              Eat together, cook together, or watch others share their meals on camera.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/marketplace">
                <Button size="lg">Browse Marketplace</Button>
              </Link>
              <Link href="#cities">
                <Button size="lg" variant="outline">Join Waitlist</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Two Pillars */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Marketplace Pillar */}
          <div className="border rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-3">Marketplace</h2>
              <p className="text-muted-foreground">
                A curated marketplace of individuals offering dining companionship.
              </p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Eat together (virtual or in-person)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Cook together virtually</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Join small group meals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Connect over conversation while eating</span>
              </li>
            </ul>

            {listings.length > 0 && (
              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-muted-foreground">Featured experiences:</p>
                {listings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/listing/${listing.slug}`}
                    className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <p className="font-medium">{listing.title}</p>
                    <p className="text-sm text-muted-foreground">
                      by {listing.hostProfile.displayName} • ${(listing.priceAmount / 100).toFixed(2)}
                    </p>
                  </Link>
                ))}
              </div>
            )}

            <Link href="/marketplace">
              <Button className="w-full" variant="outline">
                Browse All Listings <IconArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Streaming Pillar */}
          <div className="border rounded-2xl p-8 hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-background">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-3">Live Streaming</h2>
              <p className="text-muted-foreground">
                Watch and interact with people eating, cooking, and sharing meals on camera.
              </p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Eat on camera with viewers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Cook and teach in real-time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>1:1 private sessions or group rooms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Broadcast streams with live chat</span>
              </li>
            </ul>

            <div className="p-4 border rounded-lg bg-background/50 mb-6">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Coming soon:</strong> Browse live streams, 
                schedule 1:1 meal sessions, and join group cooking experiences.
              </p>
            </div>

            <Button className="w-full" disabled>
              Explore Streams <IconArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Launch Cities */}
      <section id="cities" className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-3">Launch Cities</h2>
            <p className="text-muted-foreground max-w-2xl">
              Dinewith is launching in Minneapolis-St. Paul, Chicago, and Madison. 
              Join the waitlist for your city to get early access.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/us/${city.stateSlug}/${city.slug}`}
                className="group border rounded-2xl p-6 bg-background hover:shadow-lg transition-all"
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{city.stateName}</p>
                </div>
                
                {city.headline && (
                  <p className="text-muted-foreground mb-4">
                    {city.headline}
                  </p>
                )}

                {city._count.waitlistEntries > 0 && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {city._count.waitlistEntries}+ on waitlist
                  </p>
                )}

                <div className="flex items-center text-primary font-medium">
                  Join waitlist <IconArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Host CTA */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Become a Host</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Share your passion for food and connection. Host dining experiences 
              or stream your meals to build a community.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/host/apply">
                <Button size="lg">Apply to Host</Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="outline">See Host Examples</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
