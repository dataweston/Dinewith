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
          You don't have any active listings yet.{' '}
          <a href="/host/listings/new" className="text-primary underline">
            Create a listing
          </a>{' '}
          to manage availability.
        </p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Availability</h1>
        <p className="text-muted-foreground">
          Set when you're available for bookings
        </p>
      </div>

      <AvailabilityManager listings={listings} />
    </div>
  )
}
