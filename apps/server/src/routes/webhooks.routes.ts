import { Router, Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { campaigns, campaignStatusHistory } from '../db/schema/campaigns.js';
import { verifyWebhookSignature, parseWebhookPayload } from '../integrations/braze/brazeWebhook.js';
import { mapBrazeStatusToInternal } from '../integrations/braze/brazeMapper.js';

const router = Router();

router.post('/braze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-braze-webhook-signature'] as string | undefined;
    const rawBody = JSON.stringify(req.body);

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn('[Webhook] Invalid Braze webhook signature');
      res.status(401).json({ message: 'Invalid signature' });
      return;
    }

    // Parse payload
    const payload = parseWebhookPayload(req.body);
    if (!payload) {
      res.status(400).json({ message: 'Invalid payload' });
      return;
    }

    console.log(`[Webhook] Received ${payload.event_type} for Braze campaign ${payload.campaign_id}`);

    // Find campaign by Braze campaign ID
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.brazeCampaignId, payload.campaign_id));

    if (!campaign) {
      console.warn(`[Webhook] No campaign found for Braze ID ${payload.campaign_id}`);
      res.status(200).json({ message: 'No matching campaign' });
      return;
    }

    // Update Braze status
    const brazeStatus = payload.status ?? payload.event_type.split('.')[1];
    const internalStatus = mapBrazeStatusToInternal(brazeStatus);

    await db
      .update(campaigns)
      .set({
        brazeStatus,
        ...(internalStatus !== campaign.status ? { status: internalStatus as typeof campaign.status } : {}),
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaign.id));

    // Record status change if it changed
    if (internalStatus !== campaign.status) {
      await db.insert(campaignStatusHistory).values({
        campaignId: campaign.id,
        fromStatus: campaign.status,
        toStatus: internalStatus as typeof campaign.status,
        notes: `Braze webhook: ${payload.event_type}`,
      });
    }

    res.status(200).json({ message: 'Processed' });
  } catch (err) {
    next(err);
  }
});

export default router;
