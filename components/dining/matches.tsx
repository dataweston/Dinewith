'use client'

import { useActions, useUIState } from 'ai/rsc'

import type { AI } from '@/lib/chat/actions'

interface DiningMatch {
  name: string
  tagline: string
  interests: string[]
  availability: string
  dietaryNotes?: string
}

export function Matches({ props: partners }: { props: DiningMatch[] }) {
  const [, setMessages] = useUIState<typeof AI>()
  const { submitUserMessage } = useActions()

  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-2">
      {partners.map(partner => (
        <button
          key={partner.name}
          className="flex cursor-pointer flex-col gap-2 rounded-xl border bg-card p-4 text-left transition hover:border-primary/60 hover:shadow-sm"
          onClick={async () => {
            const response = await submitUserMessage(
              `Draft an introduction message to ${partner.name} about meeting up for dinner.`
            )
            setMessages(currentMessages => [...currentMessages, response])
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-base font-semibold text-foreground">{partner.name}</p>
              <p className="text-sm text-muted-foreground">{partner.tagline}</p>
            </div>
            <span className="rounded-full bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-500">
              {partner.availability}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Shared interests:</span>{' '}
            {partner.interests.join(', ')}
          </div>
          {partner.dietaryNotes ? (
            <div className="text-xs uppercase tracking-wide text-rose-500">
              {partner.dietaryNotes}
            </div>
          ) : null}
        </button>
      ))}
    </div>
  )
}
