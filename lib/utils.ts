import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate short code for links
export function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Parse user agent to get device type, OS, and browser
export function parseUserAgent(userAgent: string | null | undefined): {
  deviceType: string
  os: string | null
  browser: string | null
} {
  if (!userAgent) {
    return { deviceType: 'UNKNOWN', os: null, browser: null }
  }

  const ua = userAgent.toLowerCase()

  // Detect device type
  let deviceType: string = 'UNKNOWN'
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = 'TABLET'
  } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
    deviceType = 'MOBILE'
  } else {
    deviceType = 'DESKTOP'
  }

  // Detect OS
  let os: string | null = null
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac')) os = 'macOS'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'

  // Detect browser
  let browser: string | null = null
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari'
  else if (ua.includes('edg')) browser = 'Edge'
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera'

  return { deviceType, os, browser }
}

// Get geographic location from IP address
export async function getGeoLocation(ip: string): Promise<{ country: string | null; city: string | null }> {
  // Skip localhost and private IPs
  if (!ip || ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return { country: null, city: null }
  }

  try {
    // Use ip-api.com (free, no API key required, 45 requests/minute)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode,city`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return { country: null, city: null }
    }

    const data = await response.json()
    
    if (data.status === 'success') {
      return {
        country: data.countryCode || null,
        city: data.city || null,
      }
    }

    return { country: null, city: null }
  } catch (error) {
    console.error('Error fetching geo location:', error)
    return { country: null, city: null }
  }
}

// Build final URL with UTM parameters
export function buildFinalUrl(originalUrl: string, utmParams: {
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  utmTerm?: string | null
  utmContent?: string | null
}): string {
  try {
    const url = new URL(originalUrl)
    
    if (utmParams.utmSource) url.searchParams.set('utm_source', utmParams.utmSource)
    if (utmParams.utmMedium) url.searchParams.set('utm_medium', utmParams.utmMedium)
    if (utmParams.utmCampaign) url.searchParams.set('utm_campaign', utmParams.utmCampaign)
    if (utmParams.utmTerm) url.searchParams.set('utm_term', utmParams.utmTerm)
    if (utmParams.utmContent) url.searchParams.set('utm_content', utmParams.utmContent)
    
    return url.toString()
  } catch {
    // If URL is invalid, try to append params manually
    const separator = originalUrl.includes('?') ? '&' : '?'
    const params: string[] = []
    
    if (utmParams.utmSource) params.push(`utm_source=${encodeURIComponent(utmParams.utmSource)}`)
    if (utmParams.utmMedium) params.push(`utm_medium=${encodeURIComponent(utmParams.utmMedium)}`)
    if (utmParams.utmCampaign) params.push(`utm_campaign=${encodeURIComponent(utmParams.utmCampaign)}`)
    if (utmParams.utmTerm) params.push(`utm_term=${encodeURIComponent(utmParams.utmTerm)}`)
    if (utmParams.utmContent) params.push(`utm_content=${encodeURIComponent(utmParams.utmContent)}`)
    
    return params.length > 0 ? `${originalUrl}${separator}${params.join('&')}` : originalUrl
  }
}

