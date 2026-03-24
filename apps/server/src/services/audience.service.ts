import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { audiences } from '../db/schema/audiences.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getAudienceByCampaignId(campaignId: string) {
  const [audience] = await db
    .select()
    .from(audiences)
    .where(eq(audiences.campaignId, campaignId));
  return audience ?? null;
}

export async function createOrUpdateAudience(
  campaignId: string,
  input: { name: string; criteriaJson: unknown },
) {
  const existing = await getAudienceByCampaignId(campaignId);

  if (existing) {
    await db
      .update(audiences)
      .set({
        name: input.name,
        criteriaJson: input.criteriaJson,
        updatedAt: new Date(),
      })
      .where(eq(audiences.id, existing.id));
    return getAudienceByCampaignId(campaignId);
  }

  const [audience] = await db
    .insert(audiences)
    .values({
      campaignId,
      name: input.name,
      criteriaJson: input.criteriaJson,
    })
    .returning();

  return audience;
}

export async function estimateAudienceSize(criteriaJson: unknown): Promise<number> {
  // In production, this would query Databricks/Braze for real segment size.
  // For MVP, return a mock estimate based on filter count.
  const criteria = criteriaJson as { filters?: unknown[] };
  const filterCount = criteria.filters?.length ?? 0;
  const base = 15000;
  const reduction = Math.min(filterCount * 2000, base - 500);
  return base - reduction;
}

export async function listSavedAudiences() {
  return db.select().from(audiences);
}
