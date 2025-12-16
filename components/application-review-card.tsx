'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { approveApplication, rejectApplication } from '@/app/mod/review/hosts/actions'
import { IconSpinner } from '@/components/ui/icons'

interface ApplicationReviewCardProps {
  application: {
    id: string
    businessName: string | null
    phone: string | null
    bio: string | null
    experienceYears: number | null
    cuisineTypes: string[]
    address: string | null
    city: string | null
    state: string | null
    zipCode: string | null
    status: string
    submittedAt: Date | null
    reviewedAt: Date | null
    reviewNotes: string | null
    kycStatus: string
    user: {
      id: string
      email: string
      name: string | null
    }
  }
}

export function ApplicationReviewCard({
  application
}: ApplicationReviewCardProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    try {
      const result = await approveApplication(application.id, reviewNotes)
      if (result.error) {
        alert(result.error)
      } else {
        setShowReviewForm(false)
        setReviewNotes('')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      const result = await rejectApplication(application.id, reviewNotes)
      if (result.error) {
        alert(result.error)
      } else {
        setShowReviewForm(false)
        setReviewNotes('')
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      DRAFT: 'outline',
      SUBMITTED: 'secondary',
      APPROVED: 'default',
      REJECTED: 'destructive'
    }
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">{application.businessName}</h3>
          <p className="text-sm text-muted-foreground">
            {application.user.name || application.user.email}
          </p>
        </div>
        {getStatusBadge(application.status)}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium">Email</p>
          <p className="text-muted-foreground">{application.user.email}</p>
        </div>
        <div>
          <p className="font-medium">Phone</p>
          <p className="text-muted-foreground">{application.phone}</p>
        </div>
        <div>
          <p className="font-medium">Experience</p>
          <p className="text-muted-foreground">
            {application.experienceYears} years
          </p>
        </div>
        <div>
          <p className="font-medium">KYC Status</p>
          <p className="text-muted-foreground">{application.kycStatus}</p>
        </div>
      </div>

      <div>
        <p className="font-medium text-sm mb-1">Location</p>
        <p className="text-sm text-muted-foreground">
          {application.address}, {application.city}, {application.state}{' '}
          {application.zipCode}
        </p>
      </div>

      <div>
        <p className="font-medium text-sm mb-1">Cuisine Types</p>
        <div className="flex flex-wrap gap-2">
          {application.cuisineTypes.map((cuisine, i) => (
            <Badge key={i} variant="outline">
              {cuisine}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <p className="font-medium text-sm mb-1">Bio</p>
        <p className="text-sm text-muted-foreground">{application.bio}</p>
      </div>

      {application.submittedAt && (
        <div>
          <p className="text-xs text-muted-foreground">
            Submitted on {new Date(application.submittedAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {application.reviewNotes && (
        <div className="border-t pt-4">
          <p className="font-medium text-sm mb-1">Review Notes</p>
          <p className="text-sm text-muted-foreground">
            {application.reviewNotes}
          </p>
          {application.reviewedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Reviewed on {new Date(application.reviewedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {application.status === 'SUBMITTED' && (
        <div className="border-t pt-4">
          {!showReviewForm ? (
            <Button onClick={() => setShowReviewForm(true)}>
              Review Application
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Review Notes (optional)
                </label>
                <Textarea
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder="Add notes about this decision..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleApprove} disabled={loading}>
                  {loading && <IconSpinner className="mr-2" />}
                  Approve
                </Button>
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  disabled={loading}
                >
                  {loading && <IconSpinner className="mr-2" />}
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    setShowReviewForm(false)
                    setReviewNotes('')
                  }}
                  variant="outline"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
