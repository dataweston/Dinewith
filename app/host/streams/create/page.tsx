'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createStream } from '@/app/streams/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function CreateStreamPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'ONE_TO_ONE' | 'SMALL_GROUP' | 'BROADCAST'>('BROADCAST')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    setIsSubmitting(true)

    const result = await createStream({
      title: title.trim(),
      description: description.trim() || undefined,
      type
    })

    setIsSubmitting(false)

    if ('error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Stream created!')
      router.push('/host/streams')
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Stream</h1>
        <p className="text-muted-foreground">
          Set up your live stream session
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Stream Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What are you eating today?"
            required
            maxLength={100}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell viewers what to expect..."
            rows={4}
            maxLength={500}
          />
        </div>

        <div>
          <Label htmlFor="type">Stream Type *</Label>
          <Select value={type} onValueChange={(v: any) => setType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BROADCAST">
                Broadcast - Open to everyone
              </SelectItem>
              <SelectItem value="SMALL_GROUP">
                Small Group - Limited viewers
              </SelectItem>
              <SelectItem value="ONE_TO_ONE">
                One-to-One - Private session
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border-t pt-6 flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Stream'}
          </Button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">⚠️ Guidelines</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>All content must be PG-13 appropriate</li>
          <li>No adult content, nudity, or sexualized behavior</li>
          <li>VODs are automatically deleted after 7 days</li>
          <li>Violations may result in account suspension</li>
        </ul>
      </div>
    </div>
  )
}
