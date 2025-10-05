'use client'

interface RestaurantDetails {
  name: string
  cuisine: string
  neighborhood: string
  highlights: string[]
  priceRange: string
  address?: string
  contact?: string
}

export function Restaurant({ props }: { props: RestaurantDetails }) {
  const { name, cuisine, neighborhood, highlights, priceRange, address, contact } = props

  return (
    <div className="space-y-3 rounded-xl border bg-card p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">
            {cuisine} · {neighborhood}
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">
          {priceRange}
        </span>
      </div>
      {address ? <p className="text-sm text-muted-foreground">{address}</p> : null}
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {highlights.map(item => (
          <li key={item} className="leading-snug">
            {item}
          </li>
        ))}
      </ul>
      {contact ? (
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Contact: {contact}
        </p>
      ) : null}
    </div>
  )
}
