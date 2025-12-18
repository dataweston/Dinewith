import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Session } from '@/lib/types'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Payout Management - Admin'
}

export default async function AdminPayoutsPage() {
  const session = (await auth()) as Session

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const payouts = await prisma.payout.findMany({
    include: {
      hostProfile: {
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }
    },
    orderBy: { requestedAt: 'desc' }
  })

  const stats = {
    pending: payouts.filter(p => p.status === 'PENDING').length,
    processing: payouts.filter(p => p.status === 'PROCESSING').length,
    completed: payouts.filter(p => p.status === 'COMPLETED').length,
    totalPending: payouts
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0)
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payout Management</h1>
        <p className="text-muted-foreground">Review and process host payout requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Processing</p>
          <p className="text-2xl font-bold">{stats.processing}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold">{stats.completed}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Pending</p>
          <p className="text-2xl font-bold">${(stats.totalPending / 100).toFixed(2)}</p>
        </div>
      </div>

      {/* Payout List */}
      <div className="space-y-3">
        {payouts.length === 0 ? (
          <p className="text-muted-foreground">No payout requests</p>
        ) : (
          payouts.map(payout => (
            <PayoutCard key={payout.id} payout={payout} />
          ))
        )}
      </div>
    </div>
  )
}

function PayoutCard({ payout }: { payout: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500'
      case 'PROCESSING': return 'bg-blue-500'
      case 'COMPLETED': return 'bg-green-500'
      case 'FAILED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="border rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-lg">${(payout.amount / 100).toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">
            {payout.hostProfile.displayName} ({payout.hostProfile.user.email})
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Requested: {new Date(payout.requestedAt).toLocaleString()}
          </p>
          {payout.notes && (
            <p className="text-sm mt-2">{payout.notes}</p>
          )}
        </div>
        <div className="text-right">
          <Badge className={getStatusColor(payout.status)}>{payout.status}</Badge>
          {payout.status === 'PENDING' && (
            <div className="mt-3 space-x-2">
              <Button size="sm">Process</Button>
              <Button size="sm" variant="outline">Mark Failed</Button>
            </div>
          )}
          {payout.completedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Completed: {new Date(payout.completedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
