import { db } from '../../db/client.js';
import { campaigns } from '../../db/schema/campaigns.js';
import { eq } from 'drizzle-orm';

export async function discoverAssets(campaignId: string): Promise<Record<string, unknown>> {
  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, campaignId));
  if (!campaign) throw new Error('Campaign not found');

  const products = (campaign.productsJson as { sku: string; name: string; deepLink?: string; imageUrl?: string }[]) ?? [];
  const discoveredAssets: { sku: string; deepLink: string; imageUrl: string }[] = [];

  // Simulate deep-link and image URL discovery for products
  for (const product of products) {
    discoveredAssets.push({
      sku: product.sku,
      deepLink: product.deepLink ?? `bees://product/${product.sku}`,
      imageUrl: product.imageUrl ?? `https://cdn.bees.com/products/${product.sku}/hero.jpg`,
    });
  }

  // Update creative JSON with discovered assets
  const existingCreative = (campaign.creativeJson as Record<string, unknown>) ?? {};
  const updatedCreative = {
    ...existingCreative,
    deepLinks: discoveredAssets.map((a) => a.deepLink),
    imageUrls: discoveredAssets.map((a) => a.imageUrl),
  };

  if (discoveredAssets.length > 0) {
    await db
      .update(campaigns)
      .set({ creativeJson: updatedCreative, updatedAt: new Date() })
      .where(eq(campaigns.id, campaignId));
  }

  return {
    campaignId,
    discoveredCount: discoveredAssets.length,
    assets: discoveredAssets,
  };
}
