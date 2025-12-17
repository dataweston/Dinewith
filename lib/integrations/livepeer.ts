// Livepeer integration for streaming

const LIVEPEER_API_KEY = process.env.LIVEPEER_API_KEY

export const livepeerEnabled = !!LIVEPEER_API_KEY

export async function createLivepeerStream(data: {
  name: string
  profiles?: Array<{ name: string; bitrate: number; fps: number; width: number; height: number }>
}) {
  if (!livepeerEnabled) {
    // Return stub data
    return {
      provider: 'livepeer-stub',
      streamId: `stub_stream_${Math.random().toString(36).substring(2)}`,
      playbackId: `stub_playback_${Math.random().toString(36).substring(2)}`,
      streamKey: `stub_key_${Math.random().toString(36).substring(2)}`
    }
  }

  try {
    const response = await fetch('https://livepeer.studio/api/stream', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LIVEPEER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        profiles: data.profiles || [
          { name: '720p', bitrate: 2000000, fps: 30, width: 1280, height: 720 },
          { name: '480p', bitrate: 1000000, fps: 30, width: 854, height: 480 },
          { name: '360p', bitrate: 500000, fps: 30, width: 640, height: 360 }
        ],
        record: true, // Enable VOD
      }),
    })

    if (!response.ok) {
      throw new Error(`Livepeer API error: ${response.statusText}`)
    }

    const stream = await response.json()

    return {
      provider: 'livepeer',
      streamId: stream.id,
      playbackId: stream.playbackId,
      streamKey: stream.streamKey
    }
  } catch (error) {
    console.error('Livepeer error:', error)
    // Fallback to stub
    return {
      provider: 'livepeer-fallback',
      streamId: `fallback_stream_${Math.random().toString(36).substring(2)}`,
      playbackId: `fallback_playback_${Math.random().toString(36).substring(2)}`,
      streamKey: `fallback_key_${Math.random().toString(36).substring(2)}`,
      error: String(error)
    }
  }
}

export async function getStreamStatus(streamId: string) {
  if (!livepeerEnabled || streamId.startsWith('stub_') || streamId.startsWith('fallback_')) {
    return {
      isActive: false,
      viewers: 0
    }
  }

  try {
    const response = await fetch(`https://livepeer.studio/api/stream/${streamId}`, {
      headers: {
        'Authorization': `Bearer ${LIVEPEER_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Livepeer API error: ${response.statusText}`)
    }

    const stream = await response.json()

    return {
      isActive: stream.isActive,
      viewers: stream.viewCount || 0
    }
  } catch (error) {
    console.error('Livepeer status error:', error)
    return {
      isActive: false,
      viewers: 0
    }
  }
}

export async function deleteStream(streamId: string) {
  if (!livepeerEnabled || streamId.startsWith('stub_') || streamId.startsWith('fallback_')) {
    return { success: true }
  }

  try {
    const response = await fetch(`https://livepeer.studio/api/stream/${streamId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${LIVEPEER_API_KEY}`,
      },
    })

    return { success: response.ok }
  } catch (error) {
    console.error('Livepeer delete error:', error)
    return { success: false, error: String(error) }
  }
}
