'use client'

export function ItinerarySkeleton() {
  return (
    <div className="space-y-2 rounded-xl border bg-muted/30 p-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-4 w-full animate-pulse rounded bg-muted" />
      ))}
    </div>
  )
}
