interface Review {
  id: string
  rating: number
  comment: string | null
  communicationRating: number | null
  experienceRating: number | null
  valueRating: number | null
  createdAt: Date
  booking: {
    guest: {
      name: string | null
      id: string
    }
  }
}

interface ListingReviewsProps {
  reviews: Review[]
  averageRating: number
  totalReviews: number
}

const renderStars = (rating: number) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  )
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function ListingReviews({ reviews, averageRating, totalReviews }: ListingReviewsProps) {
  if (!totalReviews || totalReviews === 0) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        <p className="text-muted-foreground">No reviews yet. Be the first to book!</p>
      </div>
    )
  }

  return (
    <div className="py-8 border-t">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Reviews</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
            {renderStars(Math.round(averageRating))}
          </div>
          <span className="text-muted-foreground">
            ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map(review => (
          <div key={review.id} className="border-b pb-6 last:border-b-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold">{review.booking.guest.name || 'Anonymous'}</p>
                <p className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</p>
              </div>
              {renderStars(review.rating)}
            </div>

            {review.comment && (
              <p className="mt-3 text-sm leading-relaxed">{review.comment}</p>
            )}

            {(review.communicationRating || review.experienceRating || review.valueRating) && (
              <div className="mt-4 flex gap-6 text-sm">
                {review.communicationRating && (
                  <div>
                    <p className="text-muted-foreground mb-1">Communication</p>
                    {renderStars(review.communicationRating)}
                  </div>
                )}
                {review.experienceRating && (
                  <div>
                    <p className="text-muted-foreground mb-1">Experience</p>
                    {renderStars(review.experienceRating)}
                  </div>
                )}
                {review.valueRating && (
                  <div>
                    <p className="text-muted-foreground mb-1">Value</p>
                    {renderStars(review.valueRating)}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
