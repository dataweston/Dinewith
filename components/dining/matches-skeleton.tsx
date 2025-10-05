'use client'

export function MatchesSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-xl border bg-muted/50"
        />
      ))}
    </div>
  )
}
