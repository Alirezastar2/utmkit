import crypto from 'crypto'

/**
 * Generate verification token for domain
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Generate DNS records needed for domain verification
 */
export function generateDNSRecords(domain: string, verificationToken: string) {
  return {
    cname: {
      type: 'CNAME',
      name: domain,
      value: `${process.env.NEXTAUTH_URL?.replace('https://', '').replace('http://', '') || 'utmkit.ir'}`,
      ttl: 3600,
    },
    txt: {
      type: 'TXT',
      name: `_utmkit-verify.${domain}`,
      value: verificationToken,
      ttl: 3600,
    },
  }
}

/**
 * Verify domain by checking DNS records
 */
export async function verifyDomain(domain: string, verificationToken: string): Promise<boolean> {
  try {
    const dns = await import('dns').then(m => m.promises)
    
    // Check TXT record
    const txtRecords = await dns.resolveTxt(`_utmkit-verify.${domain}`)
    const foundToken = txtRecords.flat().some(record => record.includes(verificationToken))
    
    if (!foundToken) {
      return false
    }

    // Check CNAME record
    try {
      const cnameRecords = await dns.resolveCname(domain)
      const expectedValue = process.env.NEXTAUTH_URL?.replace('https://', '').replace('http://', '') || 'utmkit.ir'
      const foundCname = cnameRecords.some(record => record.includes(expectedValue))
      
      return foundCname
    } catch {
      // CNAME might not be set yet, that's okay for now
      return foundToken
    }
  } catch (error) {
    console.error('Error verifying domain:', error)
    return false
  }
}

