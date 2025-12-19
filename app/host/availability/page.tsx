import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Session } from '@/lib/types'
import { getMyAvailability } from './actions'
import { AvailabilityManager } from '@/components/availability-manager'

export const metadata = {
  title: 'Manage Availability - Dinewith'
}

export default async function HostAvailabilityPage() {
  const session = (await auth()) as Session

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'HOST' && session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const result = await getMyAvailability()

  if ('error' in result) {
    return (
      <div className="container py-8">
        <p className="text-red-500">{result.error}</p>
      </div>
    )
  }

  const { listings } = result

  if (listings.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-4">Manage Availability</h1>
        <p className="text-muted-foreground">
          You don&apos;t have any active listings yet.{` `}
          <a href="/host/listings/new" className="text-primary underline">
            Create a listing
          </a>{` `}
          to manage availability.
        </p>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Manage Availability</h1>
        <p className="text-muted-foreground">
          Set when you&apos;re available for bookings
        </p>
      </div>

      {listings.map(listing => (
        <section key={listing.id} className="border rounded-xl p-6 space-y-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold">{listing.title}</h2>
            <p className="text-sm text-muted-foreground">
              {listing.city && listing.state
                ? `${listing.city}, ${listing.state}`
                : 'Virtual experience'}
            </p>
          </div>
          <AvailabilityManager
            listingId={listing.id}
            initialAvailability={listing.availability}
          />
        </section>
      ))}
    </div>
  )
}
