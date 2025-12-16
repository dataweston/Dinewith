import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Session } from '@/lib/types'
import { getApplications } from './actions'
import { ApplicationReviewCard } from '@/components/application-review-card'

export const metadata = {
  title: 'Review Host Applications - Dinewith'
}

export default async function ModReviewHostsPage({
  searchParams
}: {
  searchParams: { status?: string }
}) {
  const session = (await auth()) as Session

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'MODERATOR' && session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const result = await getApplications(searchParams.status)

  if ('error' in result) {
    return (
      <div className="container py-8">
        <p className="text-red-500">{result.error}</p>
      </div>
    )
  }

  const { applications } = result

  const statusCounts = {
    all: applications.length,
    submitted: applications.filter(a => a.status === 'SUBMITTED').length,
    approved: applications.filter(a => a.status === 'APPROVED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Host Applications</h1>
        <p className="text-muted-foreground">
          Review and manage host applications
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        <a
          href="/mod/review/hosts"
          className={`px-4 py-2 rounded-md ${
            !searchParams.status
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          All ({statusCounts.all})
        </a>
        <a
          href="/mod/review/hosts?status=SUBMITTED"
          className={`px-4 py-2 rounded-md ${
            searchParams.status === 'SUBMITTED'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          Submitted ({statusCounts.submitted})
        </a>
        <a
          href="/mod/review/hosts?status=APPROVED"
          className={`px-4 py-2 rounded-md ${
            searchParams.status === 'APPROVED'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          Approved ({statusCounts.approved})
        </a>
        <a
          href="/mod/review/hosts?status=REJECTED"
          className={`px-4 py-2 rounded-md ${
            searchParams.status === 'REJECTED'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          Rejected ({statusCounts.rejected})
        </a>
      </div>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <p className="text-muted-foreground">No applications found</p>
        ) : (
          applications.map(application => (
            <ApplicationReviewCard
              key={application.id}
              application={application}
            />
          ))
        )}
      </div>
    </div>
  )
}
