import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Session } from '@/lib/types'
import { getLiveStreams } from './actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Live Streams - Dinewith'
}

export default async function StreamsPage() {
  const session = (await auth()) as Session

  if (!session?.user) {
    redirect('/login')
  }

  const result = await getLiveStreams()

  if ('error' in result) {
    return (
      <div className="container py-8">
        <p className="text-red-500">{result.error}</p>
      </div>
    )
  }

  const { streams } = result

  return (
    <div className="container py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Live Streams</h1>
          <p className="text-muted-foreground">
            Watch people eat and cook in real-time
          </p>
        </div>
        {(session.user.role === 'HOST' || session.user.role === 'ADMIN') && (
          <Link href="/host/streams/create">
            <Button>Create Stream</Button>
          </Link>
        )}
      </div>

      {streams.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No Live Streams</h3>
          <p className="text-muted-foreground">
            Check back later or create your own stream!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map(stream => (
            <Link 
              key={stream.id} 
              href={`/stream/${stream.id}`}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-gray-900 relative">
                <div className="absolute top-2 left-2">
                  <Badge className="bg-red-500">🔴 LIVE</Badge>
                </div>
                {/* Placeholder for stream thumbnail */}
                <div className="flex items-center justify-center h-full text-white">
                  <span className="text-4xl">🎥</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1">{stream.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {stream.host.hostProfile?.displayName || stream.host.name}
                </p>
                {stream.description && (
                  <p className="text-sm line-clamp-2">{stream.description}</p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">{stream.type}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {stream.viewerCount} watching
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
