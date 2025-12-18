'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { acceptBooking, declineBooking, completeBooking, markNoShow } from '@/app/bookings/actions'
import { IconSpinner } from '@/components/ui/icons'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

export function BookingActionButtons({ 
  bookingId, 
  status 
}: { 
  bookingId: string
  status?: string 
}) {
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

  const handleComplete = async () => {
    setLoading(true)
    try {
      const result = await completeBooking(bookingId)
      if (result.error) {
        alert(result.error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleNoShow = async () => {
    setLoading(true)
    try {
      const result = await markNoShow(bookingId)
      if (result.error) {
        alert(result.error)
      }
    } finally {
      setLoading(false)
    }
  }

  // Show completion actions for authorized/accepted bookings
  if (status === 'AUTHORIZED' || status === 'ACCEPTED') {
    return (
      <div className="flex gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="default" disabled={loading}>
              {loading && <IconSpinner className="mr-2" />}
              Mark Complete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Complete Booking</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark the booking as completed and capture the payment.
                The guest will be able to leave a review.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleComplete}>
                Complete Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={loading}>
              {loading && <IconSpinner className="mr-2" />}
              Mark No-Show
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark as No-Show</AlertDialogTitle>
              <AlertDialogDescription>
                The guest did not show up. According to the refund policy, you
                will receive the full payment amount.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleNoShow}>
                Confirm No-Show
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // Show accept/decline for requested bookings
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
