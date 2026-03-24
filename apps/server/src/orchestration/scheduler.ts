import cron from 'node-cron';
import { eq, and, isNotNull } from 'drizzle-orm';
import { db } from '../db/client.js';
import { campaigns, campaignStatusHistory } from '../db/schema/campaigns.js';
import * as brazeApi from '../integrations/braze/brazeApi.js';
import { mapBrazeStatusToInternal } from '../integrations/braze/brazeMapper.js';

async function syncBrazeStatuses() {
  console.log('[Scheduler] Syncing Braze campaign statuses...');

  try {
    // Find all campaigns with a Braze campaign ID that are in active states
    const activeCampaigns = await db
      .select()
      .from(campaigns)
      .where(
        and(
          isNotNull(campaigns.brazeCampaignId),
          eq(campaigns.isDeleted, false),
        ),
      );

    const relevantStatuses = ['in_progress', 'in_qa', 'approved', 'launched'];
    const toSync = activeCampaigns.filter((c) => relevantStatuses.includes(c.status));

    console.log(`[Scheduler] Found ${toSync.length} campaigns to sync`);

    for (const campaign of toSync) {
      try {
        const details = await brazeApi.getCampaignDetails(campaign.brazeCampaignId!);
        const brazeStatus = details.status;
        const internalStatus = mapBrazeStatusToInternal(brazeStatus);

        // Only update if status actually changed
        if (brazeStatus !== campaign.brazeStatus) {
          await db
            .update(campaigns)
            .set({
              brazeStatus,
              ...(internalStatus !== campaign.status ? { status: internalStatus as typeof campaign.status } : {}),
              updatedAt: new Date(),
            })
            .where(eq(campaigns.id, campaign.id));

          if (internalStatus !== campaign.status) {
            await db.insert(campaignStatusHistory).values({
              campaignId: campaign.id,
              fromStatus: campaign.status,
              toStatus: internalStatus as typeof campaign.status,
              notes: `Braze sync: status changed to ${brazeStatus}`,
            });
          }

          console.log(`[Scheduler] Updated campaign ${campaign.id}: ${campaign.brazeStatus} -> ${brazeStatus}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[Scheduler] Failed to sync campaign ${campaign.id}: ${msg}`);
      }
    }

    console.log('[Scheduler] Sync complete');
  } catch (err) {
    console.error('[Scheduler] Sync failed:', err);
  }
}

export function startBrazeSyncScheduler() {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', syncBrazeStatuses);
  console.log('[Scheduler] Braze status sync scheduled (every 5 min)');
}
