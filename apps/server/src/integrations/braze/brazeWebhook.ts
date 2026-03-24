import crypto from 'crypto';
import { config } from '../../config/index.js';
import type { BrazeWebhookPayload } from './types.js';

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | undefined,
): boolean {
  if (!signature) return false;
  const expected = crypto
    .createHmac('sha256', config.BRAZE_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function parseWebhookPayload(body: unknown): BrazeWebhookPayload | null {
  const payload = body as Record<string, unknown>;

  if (!payload.event_type || !payload.campaign_id || !payload.timestamp) {
    return null;
  }

  return {
    event_type: payload.event_type as BrazeWebhookPayload['event_type'],
    campaign_id: payload.campaign_id as string,
    status: payload.status as string | undefined,
    timestamp: payload.timestamp as string,
    data: payload.data as Record<string, unknown> | undefined,
  };
}
