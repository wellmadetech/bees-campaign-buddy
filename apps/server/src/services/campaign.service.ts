import { eq, and, desc, ilike, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import {
  campaigns,
  campaignTypes,
  campaignStatusHistory,
} from '../db/schema/campaigns.js';
import { users } from '../db/schema/users.js';
import { branches } from '../db/schema/branches.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  ALLOWED_TRANSITIONS,
  type CampaignStatus,
  type CreateCampaignInput,
  type UpdateCampaignInput,
} from '@campaignbuddy/shared';

export async function listCampaigns(filters: {
  branchId?: string;
  status?: string;
  campaignTypeCode?: string;
  createdBy?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [eq(campaigns.isDeleted, false)];
  if (filters.branchId) conditions.push(eq(campaigns.branchId, filters.branchId));
  if (filters.status) conditions.push(eq(campaigns.status, filters.status as CampaignStatus));
  if (filters.createdBy) conditions.push(eq(campaigns.createdBy, filters.createdBy));
  if (filters.search) conditions.push(ilike(campaigns.title, `%${filters.search}%`));

  const where = and(...conditions);

  const [data, countResult] = await Promise.all([
    db
      .select({
        id: campaigns.id,
        title: campaigns.title,
        description: campaigns.description,
        campaignTypeId: campaigns.campaignTypeId,
        campaignTypeCode: campaignTypes.code,
        templateId: campaigns.templateId,
        branchId: campaigns.branchId,
        branchName: branches.name,
        createdBy: campaigns.createdBy,
        createdByName: users.displayName,
        assignedTo: campaigns.assignedTo,
        status: campaigns.status,
        parentId: campaigns.parentId,
        scheduledStart: campaigns.scheduledStart,
        scheduledEnd: campaigns.scheduledEnd,
        brazeCampaignId: campaigns.brazeCampaignId,
        brazeStatus: campaigns.brazeStatus,
        createdAt: campaigns.createdAt,
        updatedAt: campaigns.updatedAt,
      })
      .from(campaigns)
      .innerJoin(campaignTypes, eq(campaigns.campaignTypeId, campaignTypes.id))
      .innerJoin(branches, eq(campaigns.branchId, branches.id))
      .innerJoin(users, eq(campaigns.createdBy, users.id))
      .where(where)
      .orderBy(desc(campaigns.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(campaigns)
      .where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCampaignById(id: string) {
  const [campaign] = await db
    .select({
      id: campaigns.id,
      title: campaigns.title,
      description: campaigns.description,
      campaignTypeId: campaigns.campaignTypeId,
      campaignTypeCode: campaignTypes.code,
      templateId: campaigns.templateId,
      branchId: campaigns.branchId,
      branchName: branches.name,
      createdBy: campaigns.createdBy,
      createdByName: users.displayName,
      assignedTo: campaigns.assignedTo,
      status: campaigns.status,
      parentId: campaigns.parentId,
      scheduledStart: campaigns.scheduledStart,
      scheduledEnd: campaigns.scheduledEnd,
      contentJson: campaigns.contentJson,
      creativeJson: campaigns.creativeJson,
      productsJson: campaigns.productsJson,
      brazeCampaignId: campaigns.brazeCampaignId,
      brazeSegmentId: campaigns.brazeSegmentId,
      brazeStatus: campaigns.brazeStatus,
      isDeleted: campaigns.isDeleted,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
    })
    .from(campaigns)
    .innerJoin(campaignTypes, eq(campaigns.campaignTypeId, campaignTypes.id))
    .innerJoin(branches, eq(campaigns.branchId, branches.id))
    .innerJoin(users, eq(campaigns.createdBy, users.id))
    .where(and(eq(campaigns.id, id), eq(campaigns.isDeleted, false)));

  if (!campaign) throw new AppError(404, 'Campaign not found');
  return campaign;
}

export async function createCampaign(input: CreateCampaignInput, userId: string) {
  // Look up campaign type by code
  const [campaignType] = await db
    .select()
    .from(campaignTypes)
    .where(eq(campaignTypes.code, input.campaignTypeCode));

  if (!campaignType) throw new AppError(400, 'Invalid campaign type');

  const [campaign] = await db
    .insert(campaigns)
    .values({
      title: input.title,
      description: input.description,
      campaignTypeId: campaignType.id,
      templateId: input.templateId,
      branchId: input.branchId,
      createdBy: userId,
      scheduledStart: input.scheduledStart ? new Date(input.scheduledStart) : undefined,
      scheduledEnd: input.scheduledEnd ? new Date(input.scheduledEnd) : undefined,
      contentJson: input.contentJson,
      creativeJson: input.creativeJson,
      productsJson: input.productsJson,
    })
    .returning();

  // Record status history
  await db.insert(campaignStatusHistory).values({
    campaignId: campaign!.id,
    toStatus: 'draft',
    changedBy: userId,
  });

  return getCampaignById(campaign!.id);
}

export async function updateCampaign(id: string, input: UpdateCampaignInput) {
  const existing = await getCampaignById(id);
  if (existing.status !== 'draft' && existing.status !== 'feedback_needed') {
    throw new AppError(400, 'Campaign can only be edited in draft or feedback_needed status');
  }

  await db
    .update(campaigns)
    .set({
      ...input,
      scheduledStart: input.scheduledStart ? new Date(input.scheduledStart) : undefined,
      scheduledEnd: input.scheduledEnd ? new Date(input.scheduledEnd) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, id));

  return getCampaignById(id);
}

export async function transitionCampaign(
  id: string,
  to: CampaignStatus,
  userId: string,
  notes?: string,
) {
  const campaign = await getCampaignById(id);
  const currentStatus = campaign.status as CampaignStatus;
  const allowed = ALLOWED_TRANSITIONS[currentStatus];

  if (!allowed.includes(to)) {
    throw new AppError(400, `Cannot transition from ${currentStatus} to ${to}`);
  }

  await db.update(campaigns).set({ status: to, updatedAt: new Date() }).where(eq(campaigns.id, id));

  await db.insert(campaignStatusHistory).values({
    campaignId: id,
    fromStatus: currentStatus,
    toStatus: to,
    changedBy: userId,
    notes,
  });

  return getCampaignById(id);
}

export async function duplicateCampaign(id: string, userId: string, targetBranchId?: string) {
  const original = await getCampaignById(id);

  const [duplicate] = await db
    .insert(campaigns)
    .values({
      title: `${original.title} (Copy)`,
      description: original.description,
      campaignTypeId: original.campaignTypeId,
      templateId: original.templateId,
      branchId: targetBranchId ?? original.branchId,
      createdBy: userId,
      parentId: original.parentId,
      contentJson: original.contentJson,
      creativeJson: original.creativeJson,
      productsJson: original.productsJson,
    })
    .returning();

  await db.insert(campaignStatusHistory).values({
    campaignId: duplicate!.id,
    toStatus: 'draft',
    changedBy: userId,
    notes: `Duplicated from campaign ${id}`,
  });

  return getCampaignById(duplicate!.id);
}

export async function softDeleteCampaign(id: string) {
  await db.update(campaigns).set({ isDeleted: true, updatedAt: new Date() }).where(eq(campaigns.id, id));
}

export async function getChildCampaigns(parentId: string) {
  return db
    .select({
      id: campaigns.id,
      title: campaigns.title,
      status: campaigns.status,
      branchName: branches.name,
      createdAt: campaigns.createdAt,
    })
    .from(campaigns)
    .innerJoin(branches, eq(campaigns.branchId, branches.id))
    .where(and(eq(campaigns.parentId, parentId), eq(campaigns.isDeleted, false)))
    .orderBy(desc(campaigns.createdAt));
}

export async function linkParentCampaign(childId: string, parentId: string) {
  await db.update(campaigns).set({ parentId, updatedAt: new Date() }).where(eq(campaigns.id, childId));
  return getCampaignById(childId);
}

export async function getCampaignStats() {
  const all = await db
    .select({
      status: campaigns.status,
      campaignTypeId: campaigns.campaignTypeId,
      branchId: campaigns.branchId,
      branchName: branches.name,
      campaignTypeCode: campaignTypes.code,
    })
    .from(campaigns)
    .innerJoin(branches, eq(campaigns.branchId, branches.id))
    .innerJoin(campaignTypes, eq(campaigns.campaignTypeId, campaignTypes.id))
    .where(eq(campaigns.isDeleted, false));

  const byStatus: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byBranch: Record<string, { name: string; count: number }> = {};

  for (const c of all) {
    byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
    byType[c.campaignTypeCode] = (byType[c.campaignTypeCode] ?? 0) + 1;
    if (!byBranch[c.branchId]) byBranch[c.branchId] = { name: c.branchName, count: 0 };
    byBranch[c.branchId].count++;
  }

  return { total: all.length, byStatus, byType, byBranch };
}

export async function getCampaignHistory(campaignId: string) {
  return db
    .select({
      id: campaignStatusHistory.id,
      campaignId: campaignStatusHistory.campaignId,
      fromStatus: campaignStatusHistory.fromStatus,
      toStatus: campaignStatusHistory.toStatus,
      changedBy: campaignStatusHistory.changedBy,
      changedByName: users.displayName,
      notes: campaignStatusHistory.notes,
      createdAt: campaignStatusHistory.createdAt,
    })
    .from(campaignStatusHistory)
    .leftJoin(users, eq(campaignStatusHistory.changedBy, users.id))
    .where(eq(campaignStatusHistory.campaignId, campaignId))
    .orderBy(desc(campaignStatusHistory.createdAt));
}
