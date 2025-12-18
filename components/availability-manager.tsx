'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createAvailability, deleteAvailability } from '@/app/host/listings/[id]/availability/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Availability = {
  id: string
  type: 'SPECIFIC_DATE' | 'RECURRING'
  startTime: Date | null
  endTime: Date | null
  recurring: string | null
  isBooked: boolean
}

interface AvailabilityManagerProps {
  listingId: string
  initialAvailability: Availability[]
}

export function AvailabilityManager({
  listingId,
  initialAvailability
}: AvailabilityManagerProps) {
  const router = useRouter()
  const [type, setType] = useState<'SPECIFIC_DATE' | 'RECURRING'>('SPECIFIC_DATE')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (type === 'SPECIFIC_DATE') {
      if (!startDate || !startTime || !endDate || !endTime) {
        toast.error('Please fill in all date and time fields')
        return
      }

      const start = new Date(`${startDate}T${startTime}`)
      const end = new Date(`${endDate}T${endTime}`)

      if (end <= start) {
        toast.error('End time must be after start time')
        return
      }

      setIsSubmitting(true)

      const result = await createAvailability({
        listingId,
        type: 'SPECIFIC_DATE',
        startTime: start,
        endTime: end
      })

      setIsSubmitting(false)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Availability added')
        setStartDate('')
        setStartTime('')
        setEndDate('')
        setEndTime('')
        router.refresh()
      }
    } else {
      toast.error('Recurring availability not yet implemented')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this availability slot?')) return

    const result = await deleteAvailability(id)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Availability deleted')
      router.refresh()
    }
  }

  const formatDateTime = (date: Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  return (
    <div className="space-y-8">
      {/* Add Availability Form */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Add Availability</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select
              value={type}
              onValueChange={(value: 'SPECIFIC_DATE' | 'RECURRING') => setType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SPECIFIC_DATE">Specific Date</SelectItem>
                <SelectItem value="RECURRING" disabled>
                  Recurring (Coming Soon)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'SPECIFIC_DATE' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Availability'}
          </Button>
        </form>
      </div>

      {/* Existing Availability */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Current Availability ({initialAvailability.length})
        </h2>
        {initialAvailability.length === 0 ? (
          <p className="text-muted-foreground">
            No availability set. Add availability slots above to let guests know when you're
            available.
          </p>
        ) : (
          <div className="space-y-3">
            {initialAvailability.map(slot => (
              <div key={slot.id} className="border rounded-lg p-4 flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {slot.type === 'SPECIFIC_DATE' ? 'Specific Date' : 'Recurring'}
                  </p>
                  {slot.type === 'SPECIFIC_DATE' && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Start: {formatDateTime(slot.startTime)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        End: {formatDateTime(slot.endTime)}
                      </p>
                    </>
                  )}
                  {slot.isBooked && (
                    <p className="text-sm text-yellow-600 mt-1">⚠️ Already booked</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(slot.id)}
                  disabled={slot.isBooked}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
