'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { acceptBooking, declineBooking } from '@/app/bookings/actions'
import { IconSpinner } from '@/components/ui/icons'

export function BookingActionButtons({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false)
  const [showDeclineForm, setShowDeclineForm] = useState(false)
  const [declineReason, setDeclineReason] = useState('')

  const handleAccept = async () => {
    setLoading(true)
    try {
      const result = await acceptBooking(bookingId)
      if (result.error) {
        alert(result.error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    setLoading(true)
    try {
      const result = await declineBooking(bookingId, declineReason)
      if (result.error) {
        alert(result.error)
      } else {
        setShowDeclineForm(false)
      }
    } finally {
      setLoading(false)
    }
  }

  if (showDeclineForm) {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Reason for declining (optional)
          </label>
          <Textarea
            value={declineReason}
            onChange={e => setDeclineReason(e.target.value)}
            placeholder="Let the guest know why you can't accept this booking..."
            rows={3}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDecline} variant="destructive" disabled={loading}>
            {loading && <IconSpinner className="mr-2" />}
            Confirm Decline
          </Button>
          <Button
            onClick={() => setShowDeclineForm(false)}
            variant="outline"
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleAccept} disabled={loading}>
        {loading && <IconSpinner className="mr-2" />}
        Accept Booking
      </Button>
      <Button
        onClick={() => setShowDeclineForm(true)}
        variant="outline"
        disabled={loading}
      >
        Decline
      </Button>
    </div>
  )
}
