'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { IconSpinner } from '@/components/ui/icons'

interface HostApplicationFormProps {
  applicationId?: string
  initialData?: {
    businessName?: string
    phone?: string
    bio?: string
    experienceYears?: number
    cuisineTypes?: string[]
    address?: string
    city?: string
    state?: string
    zipCode?: string
  }
  onSaveDraft: (data: any) => Promise<void>
  onSubmit: (data: any) => Promise<void>
}

export function HostApplicationForm({
  applicationId,
  initialData = {},
  onSaveDraft,
  onSubmit
}: HostApplicationFormProps) {
  const [formData, setFormData] = useState({
    businessName: initialData.businessName || '',
    phone: initialData.phone || '',
    bio: initialData.bio || '',
    experienceYears: initialData.experienceYears || 0,
    cuisineTypes: initialData.cuisineTypes?.join(', ') || '',
    address: initialData.address || '',
    city: initialData.city || '',
    state: initialData.state || '',
    zipCode: initialData.zipCode || ''
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveDraft = async () => {
    setLoading(true)
    try {
      const data = {
        ...formData,
        experienceYears: parseInt(formData.experienceYears.toString()) || 0,
        cuisineTypes: formData.cuisineTypes
          .split(',')
          .map(c => c.trim())
          .filter(Boolean)
      }
      await onSaveDraft(data)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        ...formData,
        experienceYears: parseInt(formData.experienceYears.toString()) || 0,
        cuisineTypes: formData.cuisineTypes
          .split(',')
          .map(c => c.trim())
          .filter(Boolean)
      }
      await onSubmit(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            required
            placeholder="Your restaurant or business name"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio *</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            required
            placeholder="Tell us about your culinary background and what makes your dining experiences special..."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="experienceYears">Years of Experience *</Label>
          <Input
            id="experienceYears"
            name="experienceYears"
            type="number"
            min="0"
            value={formData.experienceYears}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="cuisineTypes">Cuisine Types *</Label>
          <Input
            id="cuisineTypes"
            name="cuisineTypes"
            value={formData.cuisineTypes}
            onChange={handleChange}
            required
            placeholder="Italian, French, Japanese (comma-separated)"
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-4">Location</h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="CA"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
                placeholder="90210"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleSaveDraft}
          disabled={loading}
        >
          {loading && <IconSpinner className="mr-2" />}
          Save Draft
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <IconSpinner className="mr-2" />}
          Submit Application
        </Button>
      </div>
    </form>
  )
}
