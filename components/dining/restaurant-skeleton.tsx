'use client'

export function RestaurantSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border bg-muted/40 p-4">
      <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
      <div className="h-4 w-full animate-pulse rounded bg-muted" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
    </div>
  )
}
