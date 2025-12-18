import { formatDistanceToNow } from 'date-fns'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  booking: {
    guest: {
      name: string | null
    }
  }
}

interface ReviewsListProps {
  reviews: Review[]
  avgRating: number
  count: number
}

export function ReviewsList({ reviews, avgRating, count }: ReviewsListProps) {
  if (count === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No reviews yet. Be the first to leave a review!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 pb-4 border-b">
        <div className="text-4xl font-bold">{avgRating.toFixed(1)}</div>
        <div>
          <div className="flex gap-1">
            {renderStars(Math.round(avgRating))}
          </div>
          <div className="text-sm text-muted-foreground">
            {count} {count === 1 ? 'review' : 'reviews'}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map(review => (
          <div key={review.id} className="border-b pb-6 last:border-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-medium">
                  {review.booking.guest.name || 'Anonymous'}
                </div>
                <div className="flex gap-1 mt-1">{renderStars(review.rating)}</div>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(review.createdAt), {
                  addSuffix: true
                })}
              </div>
            </div>
            {review.comment && (
              <p className="text-muted-foreground mt-2">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className="text-yellow-500">
      {i < rating ? '⭐' : '☆'}
    </span>
  ))
}
