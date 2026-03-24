import { db } from '../../db/client.js';
import { campaigns } from '../../db/schema/campaigns.js';
import { eq } from 'drizzle-orm';
import * as brazeApi from '../../integrations/braze/brazeApi.js';
import { mapCampaignToBraze } from '../../integrations/braze/brazeMapper.js';

export async function createBrazeDraft(campaignId: string): Promise<Record<string, unknown>> {
  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, campaignId));
  if (!campaign) throw new Error('Campaign not found');

  // If already has a Braze campaign ID, update instead of create
  if (campaign.brazeCampaignId) {
    try {
      const brazeParams = mapCampaignToBraze({
        title: campaign.title,
        description: campaign.description,
        contentJson: campaign.contentJson as Record<string, string> | null,
        creativeJson: campaign.creativeJson as Record<string, string[]> | null,
        scheduledStart: campaign.scheduledStart,
        scheduledEnd: campaign.scheduledEnd,
        brazeSegmentId: campaign.brazeSegmentId,
      });

      await brazeApi.updateCampaign(campaign.brazeCampaignId, brazeParams);

      return {
        campaignId,
        brazeCampaignId: campaign.brazeCampaignId,
        action: 'updated',
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update Braze campaign: ${msg}`);
    }
  }

  try {
    const brazeParams = mapCampaignToBraze({
      title: campaign.title,
      description: campaign.description,
      contentJson: campaign.contentJson as Record<string, string> | null,
      creativeJson: campaign.creativeJson as Record<string, string[]> | null,
      scheduledStart: campaign.scheduledStart,
      scheduledEnd: campaign.scheduledEnd,
      brazeSegmentId: campaign.brazeSegmentId,
    });

    const result = await brazeApi.createCampaign(brazeParams);

    // Store the Braze campaign ID
    await db
      .update(campaigns)
      .set({
        brazeCampaignId: result.campaign_id,
        brazeStatus: 'draft',
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId));

    return {
      campaignId,
      brazeCampaignId: result.campaign_id,
      action: 'created',
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to create Braze campaign draft: ${msg}`);
  }
}
