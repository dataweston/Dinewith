import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Session } from '@/lib/types'
import { getHostBookings } from '@/app/bookings/actions'
import { Badge } from '@/components/ui/badge'
import { BookingActionButtons } from '@/components/booking-action-buttons'

export const metadata = {
  title: 'My Bookings - Dinewith'
}

export default async function HostBookingsPage() {
  const session = (await auth()) as Session

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'HOST' && session.user.role !== 'ADMIN') {
    redirect('/host/apply')
  }

  const result = await getHostBookings()

  if ('error' in result) {
    return (
      <div className="container py-8">
        <p className="text-red-500">{result.error}</p>
      </div>
    )
  }

  const { bookings } = result

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      REQUESTED: 'secondary',
      ACCEPTED: 'default',
      AUTHORIZED: 'default',
      COMPLETED: 'outline',
      CANCELED: 'destructive',
      REFUNDED: 'outline',
      NO_SHOW: 'destructive'
    }
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Booking Requests</h1>
        <p className="text-muted-foreground">
          Manage incoming booking requests
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            No booking requests yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{booking.listing.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Guest: {booking.guest.name || booking.guest.email}
                  </p>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="font-medium">Scheduled Time</p>
                  <p className="text-muted-foreground">
                    {new Date(booking.scheduledStart).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Guests</p>
                  <p className="text-muted-foreground">{booking.guestCount}</p>
                </div>
                <div>
                  <p className="font-medium">Total Amount</p>
                  <p className="text-muted-foreground">
                    ${(booking.totalAmount / 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Your Earnings</p>
                  <p className="text-muted-foreground">
                    ${(booking.hostAmount / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              {booking.guestNotes && (
                <div className="mb-4">
                  <p className="font-medium text-sm mb-1">Guest Notes</p>
                  <p className="text-sm text-muted-foreground">{booking.guestNotes}</p>
                </div>
              )}

              {booking.status === 'REQUESTED' && (
                <BookingActionButtons bookingId={booking.id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
