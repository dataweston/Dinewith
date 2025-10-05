'use client'

interface AgendaItem {
  time: string
  description: string
  hostNotes?: string
}

interface DiningAgenda {
  title: string
  date: string
  agenda: AgendaItem[]
  tips?: string
}

export function Itinerary({ props }: { props: DiningAgenda }) {
  const { title, date, agenda, tips } = props

  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>
      <ol className="space-y-3">
        {agenda.map(item => (
          <li key={`${item.time}-${item.description}`} className="flex gap-3">
            <span className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-rose-500">
              {item.time}
            </span>
            <div className="space-y-1">
              <p className="text-sm text-foreground">{item.description}</p>
              {item.hostNotes ? (
                <p className="text-xs text-muted-foreground">{item.hostNotes}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
      {tips ? (
        <div className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-500">
          {tips}
        </div>
      ) : null}
    </div>
  )
}
