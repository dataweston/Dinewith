'use client'

import * as React from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { IconSpinner } from '@/components/ui/icons'

interface WaitlistFormProps {
  citySlug: string
  cityName: string
}

interface FormState {
  name: string
  email: string
  guests: string
  notes: string
}

const initialState: FormState = {
  name: '',
  email: '',
  guests: '',
  notes: ''
}

export function WaitlistForm({ citySlug, cityName }: WaitlistFormProps) {
  const [formState, setFormState] = React.useState<FormState>(initialState)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  function updateField(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target
    setFormState(previous => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citySlug,
          ...formState
        })
      })

      const result = await response.json()

      if (!response.ok) {
        const issueMessage = Array.isArray(result?.issues)
          ? result.issues[0]
          : Object.values(result?.issues ?? {})
              .flat()
              .filter(Boolean)[0]

        const errorMessage = issueMessage || result?.error || 'Unable to join the waitlist right now.'
        throw new Error(errorMessage)
      }

      toast.success(`We saved your spot for ${cityName}.`)
      setFormState(initialState)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Try again in a moment.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Preferred name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Casey, Kai, or The Jacksons"
          value={formState.name}
          onChange={updateField}
          disabled={isSubmitting}
          autoComplete="name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@email.com"
          value={formState.email}
          onChange={updateField}
          disabled={isSubmitting}
          autoComplete="email"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="guests">Party size</Label>
        <Input
          id="guests"
          name="guests"
          type="number"
          min={1}
          max={12}
          step={1}
          inputMode="numeric"
          placeholder="2"
          value={formState.guests}
          onChange={updateField}
          disabled={isSubmitting}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">What kind of table do you want?</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Example: founders in climate, anywhere with vinyl, soft launch preview..."
          value={formState.notes}
          onChange={updateField}
          disabled={isSubmitting}
          rows={4}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <IconSpinner className="mr-2 size-4" />}
        {isSubmitting ? 'Saving your seat...' : `Join the ${cityName} waitlist`}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        We only email when we confirm a time, chef, or collaborator. No spam, ever.
      </p>
    </form>
  )
}
