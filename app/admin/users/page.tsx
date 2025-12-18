import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Session } from '@/lib/types'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'User Management - Admin'
}

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: { role?: string }
}) {
  const session = (await auth()) as Session

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const users = await prisma.user.findMany({
    where: searchParams.role ? { role: searchParams.role as any } : {},
    include: {
      hostProfile: true,
      _count: {
        select: {
          bookings: true,
          streams: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const roleCounts = {
    all: users.length,
    ADMIN: users.filter(u => u.role === 'ADMIN').length,
    MODERATOR: users.filter(u => u.role === 'MODERATOR').length,
    HOST: users.filter(u => u.role === 'HOST').length,
    GUEST: users.filter(u => u.role === 'GUEST').length
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">View and manage platform users</p>
      </div>

      {/* Role Filter */}
      <div className="mb-6 flex gap-2">
        <a
          href="/admin/users"
          className={`px-4 py-2 rounded-md ${
            !searchParams.role
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          All ({roleCounts.all})
        </a>
        {['ADMIN', 'MODERATOR', 'HOST', 'GUEST'].map(role => (
          <a
            key={role}
            href={`/admin/users?role=${role}`}
            className={`px-4 py-2 rounded-md ${
              searchParams.role === role
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {role} ({roleCounts[role as keyof typeof roleCounts]})
          </a>
        ))}
      </div>

      {/* User List */}
      <div className="space-y-3">
        {users.map(user => (
          <div key={user.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{user.name}</p>
                  <Badge variant="outline">{user.role}</Badge>
                  {user.hostProfile && (
                    <Badge className="bg-green-500">Has Host Profile</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.hostProfile && (
                  <p className="text-sm mt-1">
                    Host: {user.hostProfile.displayName}
                  </p>
                )}
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{user._count.bookings} bookings</p>
                <p>{user._count.streams} streams</p>
                <p className="text-xs mt-1">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
