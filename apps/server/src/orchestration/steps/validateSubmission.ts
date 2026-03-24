import { db } from '../../db/client.js';
import { campaigns, campaignTypes } from '../../db/schema/campaigns.js';
import { eq } from 'drizzle-orm';

export async function validateSubmission(campaignId: string): Promise<Record<string, unknown>> {
  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, campaignId));
  if (!campaign) throw new Error('Campaign not found');
  if (!campaign.title) throw new Error('Campaign title is required');
  if (!campaign.branchId) throw new Error('Campaign branch is required');
  if (!campaign.campaignTypeId) throw new Error('Campaign type is required');

  const [type] = await db
    .select()
    .from(campaignTypes)
    .where(eq(campaignTypes.id, campaign.campaignTypeId));
  if (!type) throw new Error('Invalid campaign type');

  // Type-specific validation
  const typeCode = type.code;
  if (typeCode === 'ad_hoc_sales' || typeCode === 'ad_hoc_operational') {
    if (!campaign.contentJson) throw new Error('Content is required for ad-hoc campaigns');
  }

  return {
    campaignId,
    typeCode,
    validated: true,
    validatedAt: new Date().toISOString(),
  };
}
