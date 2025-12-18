'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { approveListing, rejectListing } from '@/app/mod/review/listings/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Listing = {
  id: string
  title: string
  slug: string
  type: string
  status: string
  priceAmount: number
  priceCurrency: string
  content: string
  city: string | null
  state: string | null
  createdAt: Date
  updatedAt: Date
  hostProfile: {
    displayName: string
    user: {
      id: string
      email: string
      name: string | null
    }
  }
}

export function ListingReviewCard({ listing }: { listing: Listing }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    if (!confirm('Approve this listing?')) return

    setLoading(true)
    const result = await approveListing(listing.id)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Listing approved')
      router.refresh()
    }
  }

  const handleReject = async () => {
    const reason = prompt('Rejection reason (optional):')
    if (reason === null) return

    setLoading(true)
    const result = await rejectListing(listing.id, reason)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Listing rejected')
      router.refresh()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-yellow-500'
      case 'ACTIVE':
        return 'bg-green-500'
      case 'REJECTED':
        return 'bg-red-500'
      case 'PAUSED':
        return 'bg-gray-500'
      case 'DRAFT':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  let contentPreview = ''
  try {
    const parsed = JSON.parse(listing.content)
    contentPreview = parsed.description || parsed.content || 'No description'
  } catch {
    contentPreview = listing.content.substring(0, 200)
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-semibold">{listing.title}</h3>
            <Badge className={getStatusColor(listing.status)}>
              {listing.status}
            </Badge>
            <Badge variant="outline">{listing.type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            by {listing.hostProfile.displayName} ({listing.hostProfile.user.email})
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">
            ${(listing.priceAmount / 100).toFixed(2)} {listing.priceCurrency}
          </p>
          {listing.city && (
            <p className="text-sm text-muted-foreground">
              {listing.city}, {listing.state}
            </p>
          )}
        </div>
      </div>

      <div className="prose prose-sm max-w-none">
        <p className="text-sm line-clamp-3">{contentPreview}</p>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>Created: {new Date(listing.createdAt).toLocaleDateString()}</p>
        <p>Updated: {new Date(listing.updatedAt).toLocaleDateString()}</p>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(`/listing/${listing.slug}`, '_blank')}
        >
          View Listing
        </Button>
        
        {listing.status === 'SUBMITTED' && (
          <>
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleReject}
              disabled={loading}
            >
              Reject
            </Button>
          </>
        )}
        
        {listing.status === 'ACTIVE' && (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleReject}
            disabled={loading}
          >
            Deactivate
          </Button>
        )}
      </div>
    </div>
  )
}
