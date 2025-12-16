'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { IconSpinner } from '@/components/ui/icons'

interface ListingFormProps {
  listing?: {
    id: string
    title: string
    type: string
    priceAmount: number
    duration?: number | null
    maxGuests: number
    content: string
    city?: string | null
    state?: string | null
  }
  onSubmit: (data: any) => Promise<void>
  onCancel?: () => void
}

export function ListingForm({ listing, onSubmit, onCancel }: ListingFormProps) {
  const [formData, setFormData] = useState({
    title: listing?.title || '',
    type: listing?.type || 'IN_PERSON',
    priceAmount: listing?.priceAmount ? listing.priceAmount / 100 : 0,
    duration: listing?.duration || 60,
    maxGuests: listing?.maxGuests || 1,
    content: listing?.content || '',
    city: listing?.city || '',
    state: listing?.state || ''
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        priceAmount: Math.round(parseFloat(formData.priceAmount.toString()) * 100),
        duration: parseInt(formData.duration.toString()),
        maxGuests: parseInt(formData.maxGuests.toString())
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title">Listing Title *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="e.g., Authentic Italian Dinner Experience"
        />
      </div>

      <div>
        <Label htmlFor="type">Experience Type *</Label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="IN_PERSON">In Person</option>
          <option value="VIRTUAL">Virtual</option>
          <option value="HYBRID">Hybrid</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priceAmount">Price (USD) *</Label>
          <Input
            id="priceAmount"
            name="priceAmount"
            type="number"
            step="0.01"
            min="0"
            value={formData.priceAmount}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min="15"
            step="15"
            value={formData.duration}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="maxGuests">Maximum Guests *</Label>
        <Input
          id="maxGuests"
          name="maxGuests"
          type="number"
          min="1"
          value={formData.maxGuests}
          onChange={handleChange}
          required
        />
      </div>

      {(formData.type === 'IN_PERSON' || formData.type === 'HYBRID') && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g., Minneapolis"
            />
          </div>

          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g., MN"
              maxLength={2}
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="content">Description & Details *</Label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          placeholder="Describe your dining experience. What makes it special? What should guests expect?"
          rows={8}
        />
        <p className="text-xs text-muted-foreground mt-1">
          This is a simple text field. Full WYSIWYG editor can be added later.
        </p>
      </div>

      <div className="flex gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <IconSpinner className="mr-2" />}
          {listing ? 'Update Listing' : 'Create Listing'}
        </Button>
      </div>
    </form>
  )
}
