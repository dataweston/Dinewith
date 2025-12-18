import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { Session } from '@/lib/types'
import { prisma } from '@/lib/prisma'
import { getListingAvailability } from './actions'
import { AvailabilityManager } from '@/components/availability-manager'

export default async function ListingAvailabilityPage({
  params
}: {
  params: { id: string }
}) {
  const session = (await auth()) as Session

  if (!session?.user) {
    redirect('/login')
  }

  // Get listing and verify ownership
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      hostProfile: true
    }
  })

  if (!listing) {
    notFound()
  }

  if (listing.hostProfile.userId !== session.user.id) {
    redirect('/')
  }

  const result = await getListingAvailability(params.id)

  if ('error' in result) {
    return (
      <div className="container py-8">
        <p className="text-red-500">{result.error}</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Availability</h1>
        <p className="text-muted-foreground mb-4">{listing.title}</p>
        <a
          href={`/host/listings/${listing.id}`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to listing
        </a>
      </div>

      <AvailabilityManager
        listingId={listing.id}
        initialAvailability={result.availability}
      />
    </div>
  )
}
