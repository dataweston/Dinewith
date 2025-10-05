'use client'

import dynamic from 'next/dynamic'
import { MatchesSkeleton } from './matches-skeleton'
import { RestaurantSkeleton } from './restaurant-skeleton'
import { ItinerarySkeleton } from './itinerary-skeleton'

export { spinner } from './spinner'
export { BotCard, BotMessage, SystemMessage, UserMessage, SpinnerMessage } from './message'

const Matches = dynamic(() => import('./matches').then(mod => mod.Matches), {
  ssr: false,
  loading: () => <MatchesSkeleton />
})

const Restaurant = dynamic(
  () => import('./restaurant').then(mod => mod.Restaurant),
  {
    ssr: false,
    loading: () => <RestaurantSkeleton />
  }
)

const Itinerary = dynamic(() => import('./itinerary').then(mod => mod.Itinerary), {
  ssr: false,
  loading: () => <ItinerarySkeleton />
})

const Booking = dynamic(() => import('./booking').then(mod => mod.Booking), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
      Checking reservation availability...
    </div>
  )
})

export { Matches, Restaurant, Itinerary, Booking }
