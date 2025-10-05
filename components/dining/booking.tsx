'use client'

import { useId, useState, type ReactNode } from 'react'
import { useActions, useAIState, useUIState } from 'ai/rsc'
import { type AI } from '@/lib/chat/actions'

interface BookingDetails {
  restaurant: string
  date: string
  time: string
  partySize: number
  notes?: string
  status: 'requires_action' | 'confirmed' | 'expired'
}

export function Booking({ props }: { props: BookingDetails }) {
  const { restaurant, date, time, partySize, notes, status } = props
  const [value, setValue] = useState(partySize || 2)
  const [bookingUI, setBookingUI] = useState<ReactNode | null>(null)
  const [aiState, setAIState] = useAIState<typeof AI>()
  const [, setMessages] = useUIState<typeof AI>()
  const { confirmReservation } = useActions()
  const id = useId()

  function onSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = Number(e.target.value)
    setValue(nextValue)

    const message = {
      role: 'system' as const,
      content: `[Host adjusted the party size to ${nextValue} guests for ${restaurant}]`,
      id
    }

    if (aiState.messages[aiState.messages.length - 1]?.id === id) {
      setAIState({
        ...aiState,
        messages: [...aiState.messages.slice(0, -1), message]
      })
      return
    }

    setAIState({ ...aiState, messages: [...aiState.messages, message] })
  }

  return (
    <div className="rounded-xl border bg-card p-5 text-sm text-foreground">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Reservation request
          </p>
          <h3 className="text-lg font-semibold">{restaurant}</h3>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div>{date}</div>
          <div>{time}</div>
        </div>
      </div>

      {notes ? <p className="mt-3 text-muted-foreground">{notes}</p> : null}

      {bookingUI ? (
        <div className="mt-4 text-muted-foreground">{bookingUI}</div>
      ) : status === 'requires_action' ? (
        <>
          <div className="relative mt-6 pb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Party size
            </p>
            <input
              id="party-size-slider"
              type="range"
              value={value}
              onChange={onSliderChange}
              min="2"
              max="10"
              className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-rose-500"
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>2 guests</span>
              <span>10 guests</span>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Summary
            </p>
            <p className="text-base font-semibold">
              Table for {value} at {time} on {date}
            </p>
          </div>

          <button
            className="mt-6 w-full rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
            onClick={async () => {
              const response = await confirmReservation(restaurant, date, time, value)
              setBookingUI(response.bookingUI)
              setMessages(currentMessages => [...currentMessages, response.newMessage])
            }}
          >
            Confirm reservation
          </button>
        </>
      ) : status === 'confirmed' ? (
        <p className="mt-4 font-medium text-emerald-500">
          Reservation confirmed for {value} guests. Enjoy your evening!
        </p>
      ) : (
        <p className="mt-4 text-muted-foreground">
          Reservation window expired. Ask Dinewith to request a new table.
        </p>
      )}
    </div>
  )
}
