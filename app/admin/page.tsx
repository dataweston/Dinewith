import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Session } from '@/lib/types'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Admin Dashboard - Dinewith'
}

export default async function AdminDashboardPage() {
  const session = (await auth()) as Session

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  // Get platform stats
  const [
    totalUsers,
    totalHosts,
    totalListings,
    activeListings,
    pendingApplications,
    submittedListings,
    totalBookings,
    completedBookings,
    pendingPayouts,
    totalReports,
    pendingReports,
    liveStreams
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'HOST' } }),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: 'ACTIVE' } }),
    prisma.hostApplication.count({ where: { status: 'SUBMITTED' } }),
    prisma.listing.count({ where: { status: 'SUBMITTED' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.payout.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } }),
    prisma.report.count(),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.stream.count({ where: { status: 'LIVE' } })
  ])

  // Get recent activity
  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      listing: { select: { title: true } },
      guest: { select: { name: true } }
    }
  })

  const recentReports = await prisma.report.findMany({
    take: 5,
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: {
      reporter: { select: { name: true } }
    }
  })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and operational controls
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Users"
          value={totalUsers}
          subtitle={`${totalHosts} hosts`}
        />
        <StatCard
          title="Active Listings"
          value={activeListings}
          subtitle={`${totalListings} total`}
        />
        <StatCard
          title="Bookings"
          value={totalBookings}
          subtitle={`${completedBookings} completed`}
        />
        <StatCard
          title="Live Now"
          value={liveStreams}
          subtitle="active streams"
          highlight={liveStreams > 0}
        />
      </div>

      {/* Action Items */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <ActionCard
          title="Pending Applications"
          count={pendingApplications}
          href="/mod/review/hosts?status=SUBMITTED"
          variant="warning"
        />
        <ActionCard
          title="Listings to Review"
          count={submittedListings}
          href="/mod/review/listings?status=SUBMITTED"
          variant="warning"
        />
        <ActionCard
          title="Pending Reports"
          count={pendingReports}
          href="/mod/reports?status=PENDING"
          variant="danger"
        />
        <ActionCard
          title="Pending Payouts"
          count={pendingPayouts}
          href="/admin/payouts"
          variant="info"
        />
        <ActionCard
          title="All Reports"
          count={totalReports}
          href="/mod/reports"
          variant="neutral"
        />
        <ActionCard
          title="User Management"
          count={totalUsers}
          href="/admin/users"
          variant="neutral"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Bookings</h2>
            <Link href="/admin/bookings">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent bookings</p>
            ) : (
              recentBookings.map(booking => (
                <div key={booking.id} className="flex justify-between items-start text-sm">
                  <div>
                    <p className="font-medium">{booking.listing.title}</p>
                    <p className="text-muted-foreground">by {booking.guest.name}</p>
                  </div>
                  <Badge variant="outline">{booking.status}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Reports */}
        <div className="border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Pending Reports</h2>
            <Link href="/mod/reports?status=PENDING">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentReports.length === 0 ? (
              <p className="text-muted-foreground text-sm">No pending reports</p>
            ) : (
              recentReports.map(report => (
                <div key={report.id} className="flex justify-between items-start text-sm">
                  <div>
                    <p className="font-medium">{report.type}</p>
                    <p className="text-muted-foreground">by {report.reporter.name}</p>
                  </div>
                  <Badge className="bg-red-500">{report.reason}</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  highlight = false 
}: { 
  title: string
  value: number
  subtitle: string
  highlight?: boolean
}) {
  return (
    <div className={`border rounded-lg p-6 ${highlight ? 'border-green-500 bg-green-50' : ''}`}>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className={`text-3xl font-bold mb-1 ${highlight ? 'text-green-600' : ''}`}>
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  )
}

function ActionCard({ 
  title, 
  count, 
  href, 
  variant = 'neutral' 
}: { 
  title: string
  count: number
  href: string
  variant?: 'warning' | 'danger' | 'info' | 'neutral'
}) {
  const colors = {
    warning: 'border-yellow-500 bg-yellow-50 hover:bg-yellow-100',
    danger: 'border-red-500 bg-red-50 hover:bg-red-100',
    info: 'border-blue-500 bg-blue-50 hover:bg-blue-100',
    neutral: 'hover:bg-gray-50'
  }

  const badgeColors = {
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-500'
  }

  return (
    <Link href={href}>
      <div className={`border rounded-lg p-6 transition-colors cursor-pointer ${colors[variant]}`}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold">{title}</h3>
          {count > 0 && (
            <Badge className={badgeColors[variant]}>{count}</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {count === 0 ? 'All clear' : `${count} item${count !== 1 ? 's' : ''} need attention`}
        </p>
      </div>
    </Link>
  )
}
