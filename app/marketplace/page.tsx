import { getActiveListings } from './actions'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Marketplace - Dinewith'
}

export default async function MarketplacePage({
  searchParams
}: {
  searchParams: { type?: string; city?: string; search?: string }
}) {
  const result = await getActiveListings(searchParams)

  if ('error' in result) {
    return (
      <div className="container py-8">
        <p className="text-red-500">{result.error}</p>
      </div>
    )
  }

  const { listings } = result

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
        <p className="text-muted-foreground">
          Discover unique dining experiences
        </p>
      </div>

      {/* Simple filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <Link href="/marketplace">
          <Button variant={!searchParams.type ? 'default' : 'outline'} size="sm">
            All
          </Button>
        </Link>
        <Link href="/marketplace?type=IN_PERSON">
          <Button
            variant={searchParams.type === 'IN_PERSON' ? 'default' : 'outline'}
            size="sm"
          >
            In Person
          </Button>
        </Link>
        <Link href="/marketplace?type=VIRTUAL">
          <Button
            variant={searchParams.type === 'VIRTUAL' ? 'default' : 'outline'}
            size="sm"
          >
            Virtual
          </Button>
        </Link>
        <Link href="/marketplace?type=HYBRID">
          <Button
            variant={searchParams.type === 'HYBRID' ? 'default' : 'outline'}
            size="sm"
          >
            Hybrid
          </Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            No listings available yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing: any) => (
            <Link
              key={listing.id}
              href={`/listing/${listing.slug}`}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  by {listing.hostProfile.displayName}
                </p>
                <div className="flex gap-2 mb-2">
                  <Badge variant="outline">{listing.type.replace('_', ' ')}</Badge>
                  {listing.city && (
                    <Badge variant="outline">{listing.city}</Badge>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {listing.content}
              </p>

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">
                  ${(listing.priceAmount / 100).toFixed(2)}
                </span>
                {listing.duration && (
                  <span className="text-sm text-muted-foreground">
                    {listing.duration} min
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
