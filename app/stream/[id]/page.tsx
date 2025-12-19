import { auth } from '@/auth'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Session } from '@/lib/types'
import { prisma } from '@/lib/prisma'
import { StreamViewer } from '@/components/stream-viewer'
import { Badge } from '@/components/ui/badge'

export default async function StreamPage({ params }: { params: { id: string } }) {
  const session = (await auth()) as Session

  if (!session?.user) {
    redirect('/login')
  }

  const stream = await prisma.stream.findUnique({
    where: { id: params.id },
    include: {
      host: {
        select: {
          name: true,
          hostProfile: {
            select: {
              displayName: true,
              avatar: true,
              bio: true
            }
          }
        }
      }
    }
  })

  if (!stream) {
    return (
      <div className="container py-8">
        <p className="text-red-500">Stream not found</p>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Video Area */}
        <div className="lg:col-span-2 space-y-4">
          <StreamViewer stream={stream} />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{stream.title}</h1>
              {stream.status === 'LIVE' && (
                <Badge className="bg-red-500">🔴 LIVE</Badge>
              )}
              {stream.status === 'ENDED' && (
                <Badge variant="outline">Ended</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span>{stream.viewerCount} watching</span>
              {stream.startedAt && (
                <span>Started {new Date(stream.startedAt).toLocaleString()}</span>
              )}
            </div>

            {stream.description && (
              <p className="text-muted-foreground">{stream.description}</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Host Info */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Host</h3>
            <div className="flex items-center gap-3">
              {stream.host.hostProfile?.avatar ? (
                <Image
                  src={stream.host.hostProfile.avatar}
                  alt={stream.host.hostProfile.displayName ?? 'Host avatar'}
                  width={48}
                  height={48}
                  className="size-12 rounded-full object-cover"
                />
              ) : (
                <div className="size-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
              )}
              <div>
                <p className="font-semibold">
                  {stream.host.hostProfile?.displayName || stream.host.name}
                </p>
                {stream.host.hostProfile?.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {stream.host.hostProfile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stream Info */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Stream Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline">{stream.type}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Viewers:</span>
                <span>{stream.maxViewers}</span>
              </div>
              {stream.duration && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{Math.floor(stream.duration / 60)}m {stream.duration % 60}s</span>
                </div>
              )}
            </div>
          </div>

          {/* Chat placeholder */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Chat</h3>
            <p className="text-sm text-muted-foreground">
              Chat feature coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
