import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Session } from '@/lib/types'
import { getHostEarnings } from './actions'
import { PayoutRequestForm } from '@/components/payout-request-form'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Payouts - Dinewith'
}

export default async function HostPayoutsPage() {
  const session = (await auth()) as Session

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'HOST' && session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const result = await getHostEarnings()

  if ('error' in result) {
    return (
      <div className="container py-8">
        <p className="text-red-500">{result.error}</p>
      </div>
    )
  }

  const {
    totalEarnings,
    totalPaidOut,
    pendingPayouts,
    availableBalance,
    completedBookings,
    payouts
  } = result

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-500',
      PROCESSING: 'bg-blue-500',
      COMPLETED: 'bg-green-500',
      FAILED: 'bg-red-500',
      CANCELED: 'bg-gray-500'
    }
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payouts & Earnings</h1>
        <p className="text-muted-foreground">
          Manage your earnings and request payouts
        </p>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Earnings</p>
          <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Available Balance</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(availableBalance)}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Pending Payouts</p>
          <p className="text-2xl font-bold text-yellow-600">
            {formatCurrency(pendingPayouts)}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Paid Out</p>
          <p className="text-2xl font-bold">{formatCurrency(totalPaidOut)}</p>
        </div>
      </div>

      {/* Request Payout */}
      {availableBalance >= 1000 && (
        <div className="border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Request Payout</h2>
          <PayoutRequestForm maxAmount={availableBalance} />
        </div>
      )}

      {/* Payout History */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Payout History</h2>
        {payouts.length === 0 ? (
          <p className="text-muted-foreground">No payouts yet</p>
        ) : (
          <div className="space-y-3">
            {payouts.map(payout => (
              <div key={payout.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{formatCurrency(payout.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      Requested: {new Date(payout.requestedAt).toLocaleDateString()}
                    </p>
                    {payout.notes && (
                      <p className="text-sm mt-1">{payout.notes}</p>
                    )}
                    {payout.failureReason && (
                      <p className="text-sm text-red-500 mt-1">
                        {payout.failureReason}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {getStatusBadge(payout.status)}
                    {payout.completedAt && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Completed: {new Date(payout.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Bookings */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Completed Bookings ({completedBookings.length})
        </h2>
        {completedBookings.length === 0 ? (
          <p className="text-muted-foreground">No completed bookings yet</p>
        ) : (
          <div className="space-y-3">
            {completedBookings.map(booking => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{booking.listing.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Guest: {booking.guest.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.scheduledStart).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      +{formatCurrency(booking.hostAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total: {formatCurrency(booking.totalAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Fee: {formatCurrency(booking.platformFee)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
