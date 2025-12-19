'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { requestPayout } from '@/app/host/payouts/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface PayoutRequestFormProps {
  maxAmount: number
}

export function PayoutRequestForm({ maxAmount }: PayoutRequestFormProps) {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amountInCents = Math.round(parseFloat(amount) * 100)

    if (isNaN(amountInCents) || amountInCents <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (amountInCents > maxAmount) {
      toast.error('Amount exceeds available balance')
      return
    }

    setIsSubmitting(true)

    const result = await requestPayout(amountInCents, notes.trim() || undefined)

    setIsSubmitting(false)

    if ('error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Payout requested successfully!')
      setAmount('')
      setNotes('')
      router.refresh()
    }
  }

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Amount (USD)</Label>
        <div className="flex gap-2 items-center">
          <span className="text-lg">$</span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="10.00"
            max={formatCurrency(maxAmount)}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Available: ${formatCurrency(maxAmount)} (Minimum: $10.00)
        </p>
      </div>

      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add any notes about this payout request..."
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setAmount(formatCurrency(maxAmount))}
        >
          Request Full Amount
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Request Payout'}
        </Button>
      </div>
    </form>
  )
}
