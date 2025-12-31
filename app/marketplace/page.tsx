import { getActiveListings } from './actions'
import { MarketplaceCard } from '@/components/marketplace-card'
import { MarketplaceToolbar } from '@/components/marketplace-toolbar'
import { CategorySection } from '@/components/marketplace-category-section'

export const metadata = {
  title: 'Marketplace - Dinewith'
}

export default async function MarketplacePage({
  searchParams
}: {
  searchParams: { 
    type?: string
    city?: string
    search?: string
    sort?: 'recommended' | 'price-low' | 'price-high' | 'rating'
  }
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

  // Group listings by type for category sections
  const groupedListings = listings.reduce(
    (acc, listing) => {
      const type = listing.type
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(listing)
      return acc
    },
    {} as Record<string, typeof listings>
  )

  const typeLabels: Record<string, string> = {
    IN_PERSON: 'In-Person Experiences',
    VIRTUAL: 'Virtual Experiences',
    HYBRID: 'Hybrid Experiences'
  }

  const typeDescriptions: Record<string, string> = {
    IN_PERSON: 'Share a meal or cooking session in person',
    VIRTUAL: 'Connect with hosts over video',
    HYBRID: 'Choose your preferred format'
  }

  return (
    <div className="container py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">
          Marketplace
        </h1>
        <p className="text-lg text-gray-600">
          Discover unique dining experiences and connect with fascinating hosts
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-12">
        <MarketplaceToolbar
          currentType={searchParams.type || null}
          currentSort={(searchParams.sort as any) || 'recommended'}
          currentSearch={searchParams.search || ''}
        />
      </div>

      {/* Content */}
      {listings.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-lg text-gray-500">
            No listings available that match your criteria. Try adjusting your filters or check back soon!
          </p>
        </div>
      ) : searchParams.type ? (
        // Single type view (when filtered)
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing: any) => (
            <MarketplaceCard
              key={listing.id}
              id={listing.id}
              slug={listing.slug}
              title={listing.title}
              hostName={listing.hostProfile.displayName}
              hostTagline={listing.hostProfile.tagline}
              hostAvatar={listing.hostProfile.avatar}
              price={listing.priceAmount}
              type={listing.type}
              bio={listing.hostProfile.bio}
              priceLabel={listing.duration ? `${listing.duration}min` : 'Session'}
            />
          ))}
        </div>
      ) : (
        // Category sections (when showing all)
        <div>
          {(
            ['IN_PERSON', 'VIRTUAL', 'HYBRID'] as const
          ).map((type) => (
            <CategorySection
              key={type}
              title={typeLabels[type]}
              subtitle={typeDescriptions[type]}
              isEmpty={!groupedListings[type] || groupedListings[type].length === 0}
            >
              {groupedListings[type] &&
                groupedListings[type].map((listing: any) => (
                  <MarketplaceCard
                    key={listing.id}
                    id={listing.id}
                    slug={listing.slug}
                    title={listing.title}
                    hostName={listing.hostProfile.displayName}
                    hostTagline={listing.hostProfile.tagline}
                    hostAvatar={listing.hostProfile.avatar}
                    price={listing.priceAmount}
                    type={listing.type}
                    bio={listing.hostProfile.bio}
                    priceLabel={listing.duration ? `${listing.duration}min` : 'Session'}
                  />
                ))}
            </CategorySection>
          ))}
        </div>
      )}
    </div>
  )
}
