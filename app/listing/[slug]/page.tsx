import { getListingBySlug } from '@/app/marketplace/actions'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export async function generateMetadata({
  params
}: {
  params: { slug: string }
}) {
  const result = await getListingBySlug(params.slug)

  if ('error' in result) {
    return { title: 'Listing Not Found' }
  }

  const { listing } = result

  return {
    title: `${listing.title} - Dinewith`,
    description: listing.content.substring(0, 160)
  }
}

export default async function ListingDetailPage({
  params
}: {
  params: { slug: string }
}) {
  const result = await getListingBySlug(params.slug)

  if ('error' in result) {
    notFound()
  }

  const { listing } = result

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.content,
    offers: {
      '@type': 'Offer',
      price: (listing.priceAmount / 100).toFixed(2),
      priceCurrency: listing.priceCurrency,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Person',
        name: listing.hostProfile.displayName
      }
    },
    provider: {
      '@type': 'Person',
      name: listing.hostProfile.displayName
    }
  }

  if (listing.city && listing.state) {
    (jsonLd as any).location = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: listing.city,
        addressRegion: listing.state,
        addressCountry: listing.country || 'US'
      }
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <Badge>{listing.type.replace('_', ' ')}</Badge>
            {listing.city && <Badge variant="outline">{listing.city}, {listing.state}</Badge>}
          </div>

          <h1 className="text-4xl font-bold mb-4">{listing.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <span>Hosted by {listing.hostProfile.displayName}</span>
            {listing.duration && <span>• {listing.duration} minutes</span>}
            <span>• Up to {listing.maxGuests} guests</span>
          </div>

          <div className="text-3xl font-bold mb-8">
            ${(listing.priceAmount / 100).toFixed(2)} <span className="text-lg font-normal text-muted-foreground">per person</span>
          </div>
        </div>

        <div className="border rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">About This Experience</h2>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{listing.content}</p>
          </div>
        </div>

        {listing.hostProfile.cuisines && listing.hostProfile.cuisines.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Cuisines</h3>
            <div className="flex gap-2 flex-wrap">
              {listing.hostProfile.cuisines.map((cuisine: string) => (
                <Badge key={cuisine} variant="outline">{cuisine}</Badge>
              ))}
            </div>
          </div>
        )}

        {listing.availability && listing.availability.length > 0 && (
          <div className="border rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Availability</h2>
            <div className="space-y-2">
              {listing.availability.map((slot: any) => (
                <div key={slot.id} className="flex justify-between items-center">
                  <span>
                    {new Date(slot.startTime).toLocaleDateString()} at{' '}
                    {new Date(slot.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <Link href={`/listing/${listing.slug}/book?slot=${slot.id}`}>
                    <Button size="sm">Request Booking</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border rounded-lg p-6">
          <Link href={`/listing/${listing.slug}/book`}>
            <Button size="lg" className="w-full">
              Request to Book
            </Button>
          </Link>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>{listing.viewCount} views • {listing.bookingCount} bookings</p>
        </div>
      </div>
    </>
  )
}
