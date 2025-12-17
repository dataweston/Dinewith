// Agora integration for 1:1 video rooms

const AGORA_APP_ID = process.env.AGORA_APP_ID
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE

export const agoraEnabled = !!AGORA_APP_ID && !!AGORA_APP_CERTIFICATE

// Simple token generation for Agora
// In production, consider using the official Agora SDK
function generateAgoraToken(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number,
  role: 'publisher' | 'subscriber',
  expireTime: number = 3600
): string {
  // This is a simplified stub
  // Real implementation would use RtcTokenBuilder from agora-access-token
  const timestamp = Math.floor(Date.now() / 1000)
  const privilegeExpiredTs = timestamp + expireTime

  // Return a stub token format
  return `agora_token_${appId}_${channelName}_${uid}_${privilegeExpiredTs}`
}

export async function createAgoraRoom(data: {
  channelName: string
  hostUid: number
  guestUid: number
  expireTime?: number
}) {
  if (!agoraEnabled) {
    // Return stub data
    return {
      provider: 'agora-stub',
      appId: 'stub_app_id',
      channelName: data.channelName,
      hostToken: `stub_host_token_${Math.random().toString(36).substring(2)}`,
      guestToken: `stub_guest_token_${Math.random().toString(36).substring(2)}`,
      uid: {
        host: data.hostUid,
        guest: data.guestUid
      }
    }
  }

  try {
    const hostToken = generateAgoraToken(
      AGORA_APP_ID!,
      AGORA_APP_CERTIFICATE!,
      data.channelName,
      data.hostUid,
      'publisher',
      data.expireTime
    )

    const guestToken = generateAgoraToken(
      AGORA_APP_ID!,
      AGORA_APP_CERTIFICATE!,
      data.channelName,
      data.guestUid,
      'publisher',
      data.expireTime
    )

    return {
      provider: 'agora',
      appId: AGORA_APP_ID,
      channelName: data.channelName,
      hostToken,
      guestToken,
      uid: {
        host: data.hostUid,
        guest: data.guestUid
      }
    }
  } catch (error) {
    console.error('Agora error:', error)
    // Fallback to stub
    return {
      provider: 'agora-fallback',
      appId: 'fallback_app_id',
      channelName: data.channelName,
      hostToken: `fallback_host_token_${Math.random().toString(36).substring(2)}`,
      guestToken: `fallback_guest_token_${Math.random().toString(36).substring(2)}`,
      uid: {
        host: data.hostUid,
        guest: data.guestUid
      },
      error: String(error)
    }
  }
}

export function generateRtcToken(channelName: string, uid: number, role: 'publisher' | 'subscriber' = 'publisher') {
  if (!agoraEnabled) {
    return `stub_rtc_token_${channelName}_${uid}`
  }

  return generateAgoraToken(
    AGORA_APP_ID!,
    AGORA_APP_CERTIFICATE!,
    channelName,
    uid,
    role
  )
}
