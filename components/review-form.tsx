'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createReview } from '@/app/reviews/actions'
import { IconSpinner } from '@/components/ui/icons'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

interface ReviewFormProps {
  bookingId: string
  listingTitle: string
  onSuccess?: () => void
}

export function ReviewForm({
  bookingId,
  listingTitle,
  onSuccess
}: ReviewFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [communicationRating, setCommunicationRating] = useState(5)
  const [experienceRating, setExperienceRating] = useState(5)
  const [valueRating, setValueRating] = useState(5)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createReview({
        bookingId,
        rating,
        comment: comment.trim() || undefined,
        communicationRating,
        experienceRating,
        valueRating
      })

      if (result.error) {
        alert(result.error)
      } else {
        setOpen(false)
        onSuccess?.()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Leave Review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience with {listingTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rating">Overall Rating *</Label>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <div>
              <Label htmlFor="communication">Communication</Label>
              <StarRating
                value={communicationRating}
                onChange={setCommunicationRating}
              />
            </div>

            <div>
              <Label htmlFor="experience">Experience</Label>
              <StarRating
                value={experienceRating}
                onChange={setExperienceRating}
              />
            </div>

            <div>
              <Label htmlFor="value">Value</Label>
              <StarRating value={valueRating} onChange={setValueRating} />
            </div>

            <div>
              <Label htmlFor="comment">Your Review (Optional)</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Tell others about your experience..."
                rows={4}
                maxLength={1000}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {comment.length}/1000 characters
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <IconSpinner className="mr-2" />}
              Submit Review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function StarRating({
  value,
  onChange
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex gap-1 mt-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="text-2xl focus:outline-none transition-colors"
        >
          {star <= value ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  )
}
