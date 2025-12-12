import { prisma } from './prisma'
import crypto from 'crypto'

export interface WebhookPayload {
  event: string
  timestamp: string
  data: any
}

/**
 * Trigger webhooks for a specific event
 */
export async function triggerWebhooks(
  userId: string,
  event: string,
  data: any
): Promise<void> {
  try {
    // Find active webhooks for this user that listen to this event
    const webhooks = await prisma.webhook.findMany({
      where: {
        userId,
        isActive: true,
        events: {
          contains: event,
        },
      },
    })

    if (webhooks.length === 0) {
      return
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    }

    // Trigger all webhooks in parallel (don't wait for response)
    webhooks.forEach(async (webhook) => {
      try {
        const body = JSON.stringify(payload)
        let headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'UTMKit-Webhook/1.0',
        }

        // Add signature if secret exists
        if (webhook.secret) {
          const signature = crypto
            .createHmac('sha256', webhook.secret)
            .update(body)
            .digest('hex')
          headers['X-Webhook-Signature'] = `sha256=${signature}`
        }

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body,
        })

        // Update last trigger time
        await prisma.webhook.update({
          where: { id: webhook.id },
          data: { lastTrigger: new Date() },
        })

        if (!response.ok) {
          console.error(
            `Webhook ${webhook.id} failed: ${response.status} ${response.statusText}`
          )
        }
      } catch (error) {
        console.error(`Error triggering webhook ${webhook.id}:`, error)
      }
    })
  } catch (error) {
    console.error('Error in triggerWebhooks:', error)
  }
}

/**
 * Generate a random secret for webhook
 */
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex')
}

