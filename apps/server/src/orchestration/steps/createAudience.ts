import { db } from '../../db/client.js';
import { campaigns } from '../../db/schema/campaigns.js';
import { audiences } from '../../db/schema/audiences.js';
import { eq } from 'drizzle-orm';
import * as brazeApi from '../../integrations/braze/brazeApi.js';
import { mapAudienceToBrazeSegment } from '../../integrations/braze/brazeMapper.js';

export async function createAudience(campaignId: string): Promise<Record<string, unknown>> {
  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, campaignId));
  if (!campaign) throw new Error('Campaign not found');

  // Check if audience exists for this campaign
  const [audience] = await db
    .select()
    .from(audiences)
    .where(eq(audiences.campaignId, campaignId));

  if (!audience) {
    return {
      campaignId,
      segmentCreated: false,
      reason: 'No audience defined — campaign will use branch-level targeting',
    };
  }

  // If already has a Braze segment ID, skip
  if (audience.brazeSegmentId) {
    return {
      campaignId,
      segmentId: audience.brazeSegmentId,
      segmentCreated: false,
      reason: 'Audience segment already exists in Braze',
    };
  }

  try {
    // Map audience criteria to Braze segment format and create
    const brazeSegment = mapAudienceToBrazeSegment(audience as {
      name: string;
      criteriaJson: { filters: { field: string; operator: string; value: unknown }[]; logic: 'AND' | 'OR' };
    });
    const result = await brazeApi.createSegment(brazeSegment);

    // Store the Braze segment ID
    await db
      .update(audiences)
      .set({ brazeSegmentId: result.segment_id, updatedAt: new Date() })
      .where(eq(audiences.id, audience.id));

    // Also store on the campaign for quick reference
    await db
      .update(campaigns)
      .set({ brazeSegmentId: result.segment_id, updatedAt: new Date() })
      .where(eq(campaigns.id, campaignId));

    return {
      campaignId,
      segmentId: result.segment_id,
      segmentCreated: true,
      segmentName: brazeSegment.name,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to create Braze segment: ${msg}`);
  }
}
