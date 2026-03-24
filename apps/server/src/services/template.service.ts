import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { templates } from '../db/schema/templates.js';
import { AppError } from '../middleware/errorHandler.js';

export async function listTemplates(filters?: { campaignTypeId?: string; channel?: string }) {
  let result = await db.select().from(templates).where(eq(templates.isActive, true));
  if (filters?.campaignTypeId) {
    result = result.filter((t) => t.campaignTypeId === filters.campaignTypeId);
  }
  if (filters?.channel) {
    result = result.filter((t) => t.channel === filters.channel);
  }
  return result;
}

export async function getTemplateById(id: string) {
  const [template] = await db.select().from(templates).where(eq(templates.id, id));
  if (!template) throw new AppError(404, 'Template not found');
  return template;
}

export async function createTemplate(input: {
  name: string;
  campaignTypeId?: string;
  brazeTemplateId?: string;
  channel: string;
  contentJson: Record<string, unknown>;
  thumbnailUrl?: string;
}) {
  const [template] = await db.insert(templates).values(input).returning();
  return template;
}

export async function updateTemplate(
  id: string,
  input: {
    name?: string;
    campaignTypeId?: string;
    brazeTemplateId?: string;
    channel?: string;
    contentJson?: Record<string, unknown>;
    thumbnailUrl?: string;
  },
) {
  await getTemplateById(id);
  await db
    .update(templates)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(templates.id, id));
  return getTemplateById(id);
}

export async function deleteTemplate(id: string) {
  await db.update(templates).set({ isActive: false, updatedAt: new Date() }).where(eq(templates.id, id));
}
