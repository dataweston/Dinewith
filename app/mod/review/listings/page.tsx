import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Session } from '@/lib/types'
import { getSubmittedListings } from './actions'
import { ListingReviewCard } from '@/components/listing-review-card'

export const metadata = {
  title: 'Review Listings - Dinewith'
}

export default async function ModReviewListingsPage({
  searchParams
}: {
  searchParams: { status?: string }
}) {
  const session = (await auth()) as Session

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'MODERATOR' && session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const result = await getSubmittedListings(searchParams.status)

  if ('error' in result) {
    return (
      <div className="container py-8">
        <p className="text-red-500">{result.error}</p>
      </div>
    )
  }

  const { listings } = result

  const statusCounts = {
    all: listings.length,
    submitted: listings.filter(l => l.status === 'SUBMITTED').length,
    active: listings.filter(l => l.status === 'ACTIVE').length,
    rejected: listings.filter(l => l.status === 'REJECTED').length,
    paused: listings.filter(l => l.status === 'PAUSED').length
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Review Listings</h1>
        <p className="text-muted-foreground">
          Review and manage submitted listings
        </p>
      </div>

      <div className="mb-6 flex gap-2 flex-wrap">
        <a
          href="/mod/review/listings"
          className={`px-4 py-2 rounded-md ${
            !searchParams.status
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          All ({statusCounts.all})
        </a>
        <a
          href="/mod/review/listings?status=SUBMITTED"
          className={`px-4 py-2 rounded-md ${
            searchParams.status === 'SUBMITTED'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          Submitted ({statusCounts.submitted})
        </a>
        <a
          href="/mod/review/listings?status=ACTIVE"
          className={`px-4 py-2 rounded-md ${
            searchParams.status === 'ACTIVE'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          Active ({statusCounts.active})
        </a>
        <a
          href="/mod/review/listings?status=REJECTED"
          className={`px-4 py-2 rounded-md ${
            searchParams.status === 'REJECTED'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          Rejected ({statusCounts.rejected})
        </a>
        <a
          href="/mod/review/listings?status=PAUSED"
          className={`px-4 py-2 rounded-md ${
            searchParams.status === 'PAUSED'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          Paused ({statusCounts.paused})
        </a>
      </div>

      <div className="space-y-4">
        {listings.length === 0 ? (
          <p className="text-muted-foreground">No listings found</p>
        ) : (
          listings.map(listing => (
            <ListingReviewCard key={listing.id} listing={listing} />
          ))
        )}
      </div>
    </div>
  )
}
