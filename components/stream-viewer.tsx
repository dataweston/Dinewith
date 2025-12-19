'use client'

import { useEffect, useRef } from 'react'

type Stream = {
  id: string
  status: string
  type: string
  livepeerStreamId?: string | null
  playbackId?: string | null
  vodUrl?: string | null
}

export function StreamViewer({ stream }: { stream: Stream }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // In production, integrate with Livepeer or Agora
    // For BROADCAST: Use Livepeer playback URL
    // For ONE_TO_ONE/SMALL_GROUP: Use Agora video SDK
    
    if (stream.status === 'LIVE' && stream.playbackId) {
      // Example Livepeer playback:
      // const playbackUrl = `https://livepeer.studio/api/playback/${stream.playbackId}/index.m3u8`
      console.log('Stream playback ID:', stream.playbackId)
    }

    if (stream.status === 'ENDED' && stream.vodUrl) {
      // Load VOD if available
      console.log('VOD URL:', stream.vodUrl)
    }
  }, [stream])

  if (stream.status === 'CREATED') {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-2">🎥</p>
          <p>Stream hasn&apos;t started yet</p>
          <p className="text-sm text-gray-400 mt-1">Check back soon!</p>
        </div>
      </div>
    )
  }

  if (stream.status === 'ENDED' && !stream.vodUrl) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-2">📹</p>
          <p>This stream has ended</p>
          <p className="text-sm text-gray-400 mt-1">
            VOD may be available if enabled
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="size-full"
        controls
        autoPlay={stream.status === 'LIVE'}
      >
        {/* In production, add proper video source */}
        <p className="text-white p-4">
          Video player integration pending. Stream ID: {stream.id}
        </p>
      </video>
      
      {/* Placeholder overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-white text-center bg-black/50 p-8 rounded-lg">
          <p className="text-2xl mb-2">🎥</p>
          <p className="font-semibold">Video Player</p>
          <p className="text-sm text-gray-300 mt-1">
            {stream.status === 'LIVE' ? 'LIVE Stream' : 'Video Playback'}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Livepeer/Agora integration required
          </p>
        </div>
      </div>
    </div>
  )
}
