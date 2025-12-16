import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Session } from '@/lib/types'
import { getMyListings } from './actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'My Listings - Dinewith'
}

export default async function HostListingsPage() {
  const session = (await auth()) as Session

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'HOST' && session.user.role !== 'ADMIN') {
    redirect('/host/apply')
  }

  const result = await getMyListings()

  if ('error' in result) {
    return (
      <div className="container py-8">
        <p className="text-red-500">{result.error}</p>
      </div>
    )
  }

  const { listings } = result

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      DRAFT: 'outline',
      SUBMITTED: 'secondary',
      ACTIVE: 'default',
      PAUSED: 'secondary',
      REJECTED: 'destructive'
    }
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Listings</h1>
          <p className="text-muted-foreground">
            Manage your dining experiences
          </p>
        </div>
        <Link href="/host/listings/new">
          <Button>Create New Listing</Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">
            You haven&apos;t created any listings yet
          </p>
          <Link href="/host/listings/new">
            <Button>Create Your First Listing</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing: any) => (
            <div key={listing.id} className="border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{listing.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {listing.type} • ${(listing.priceAmount / 100).toFixed(2)}
                    {listing.duration && ` • ${listing.duration} min`}
                  </p>
                </div>
                {getStatusBadge(listing.status)}
              </div>

              <div className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {listing.content}
              </div>

              <div className="flex gap-2">
                <Link href={`/host/listings/${listing.id}/edit`}>
                  <Button size="sm" variant="outline">Edit</Button>
                </Link>
                {listing.status === 'ACTIVE' && (
                  <Link href={`/listing/${listing.slug}`}>
                    <Button size="sm" variant="outline">View Public</Button>
                  </Link>
                )}
                {listing.status === 'DRAFT' && (
                  <Link href={`/host/listings/${listing.id}/edit?submit=true`}>
                    <Button size="sm">Submit for Review</Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
