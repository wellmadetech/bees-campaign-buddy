import { db } from '../../db/client.js';
import { campaigns, campaignTypes } from '../../db/schema/campaigns.js';
import { templates } from '../../db/schema/templates.js';
import { eq } from 'drizzle-orm';

export async function matchTemplate(campaignId: string): Promise<Record<string, unknown>> {
  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, campaignId));
  if (!campaign) throw new Error('Campaign not found');

  // If template already selected, skip
  if (campaign.templateId) {
    return {
      campaignId,
      templateId: campaign.templateId,
      matched: false,
      reason: 'Template already assigned',
    };
  }

  // Check if campaign type has a default template
  const [type] = await db
    .select()
    .from(campaignTypes)
    .where(eq(campaignTypes.id, campaign.campaignTypeId));

  if (type?.defaultTemplateId) {
    await db
      .update(campaigns)
      .set({ templateId: type.defaultTemplateId, updatedAt: new Date() })
      .where(eq(campaigns.id, campaignId));

    return {
      campaignId,
      templateId: type.defaultTemplateId,
      matched: true,
      reason: 'Matched default template for campaign type',
    };
  }

  // Find any active template for this campaign type
  const availableTemplates = await db
    .select()
    .from(templates)
    .where(eq(templates.isActive, true));

  const match = availableTemplates.find((t) => t.campaignTypeId === campaign.campaignTypeId);

  if (match) {
    await db
      .update(campaigns)
      .set({ templateId: match.id, updatedAt: new Date() })
      .where(eq(campaigns.id, campaignId));

    return {
      campaignId,
      templateId: match.id,
      matched: true,
      reason: 'Auto-matched template by campaign type',
    };
  }

  return {
    campaignId,
    templateId: null,
    matched: false,
    reason: 'No matching template found — using custom content',
  };
}
