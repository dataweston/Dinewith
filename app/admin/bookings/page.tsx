import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Session } from '@/lib/types'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'All Bookings - Admin'
}

export default async function AdminBookingsPage({
  searchParams
}: {
  searchParams: { status?: string }
}) {
  const session = (await auth()) as Session

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const bookings = await prisma.booking.findMany({
    where: searchParams.status ? { status: searchParams.status as any } : {},
    include: {
      listing: {
        select: { title: true }
      },
      guest: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  })

  const statusCounts = {
    all: bookings.length,
    REQUESTED: bookings.filter(b => b.status === 'REQUESTED').length,
    ACCEPTED: bookings.filter(b => b.status === 'ACCEPTED').length,
    AUTHORIZED: bookings.filter(b => b.status === 'AUTHORIZED').length,
    COMPLETED: bookings.filter(b => b.status === 'COMPLETED').length,
    CANCELED: bookings.filter(b => b.status === 'CANCELED').length
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Bookings</h1>
        <p className="text-muted-foreground">Platform-wide booking activity</p>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <a
          href="/admin/bookings"
          className={`px-4 py-2 rounded-md ${
            !searchParams.status
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          All ({statusCounts.all})
        </a>
        {['REQUESTED', 'ACCEPTED', 'AUTHORIZED', 'COMPLETED', 'CANCELED'].map(status => (
          <a
            key={status}
            href={`/admin/bookings?status=${status}`}
            className={`px-4 py-2 rounded-md ${
              searchParams.status === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {status} ({statusCounts[status as keyof typeof statusCounts]})
          </a>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {bookings.map(booking => (
          <div key={booking.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{booking.listing.title}</p>
                <p className="text-sm text-muted-foreground">
                  Guest: {booking.guest.name} ({booking.guest.email})
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(booking.scheduledStart).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline">{booking.status}</Badge>
                <p className="text-sm font-semibold mt-2">
                  ${(booking.totalAmount / 100).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Fee: ${(booking.platformFee / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
