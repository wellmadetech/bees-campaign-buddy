import crypto from 'crypto';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/client.js';
import { invites, organizations } from '../db/schema/invites.js';
import { AppError } from '../middleware/errorHandler.js';

export async function createInvite(input: {
  email: string;
  role: string;
  organizationId?: string;
  invitedBy: string;
  message?: string;
  branchIds?: string[];
}) {
  // Check for existing pending invite
  const [existing] = await db
    .select()
    .from(invites)
    .where(and(eq(invites.email, input.email), eq(invites.status, 'pending')));

  if (existing) throw new AppError(409, 'A pending invite already exists for this email');

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [invite] = await db
    .insert(invites)
    .values({
      email: input.email,
      role: input.role,
      organizationId: input.organizationId,
      invitedBy: input.invitedBy,
      token,
      message: input.message,
      branchIds: input.branchIds ? JSON.stringify(input.branchIds) : null,
      expiresAt,
    })
    .returning();

  return invite;
}

export async function listInvites(filters?: { status?: string }) {
  let result = await db.select().from(invites);
  if (filters?.status) {
    result = result.filter((i) => i.status === filters.status);
  }
  return result;
}

export async function getInviteByToken(token: string) {
  const [invite] = await db.select().from(invites).where(eq(invites.token, token));
  if (!invite) throw new AppError(404, 'Invite not found');
  if (invite.status !== 'pending') throw new AppError(400, 'Invite is no longer valid');
  if (new Date() > invite.expiresAt) throw new AppError(400, 'Invite has expired');
  return invite;
}

export async function acceptInvite(token: string) {
  const invite = await getInviteByToken(token);
  await db
    .update(invites)
    .set({ status: 'accepted', acceptedAt: new Date() })
    .where(eq(invites.id, invite.id));
  return invite;
}

export async function revokeInvite(id: string) {
  await db.update(invites).set({ status: 'revoked' }).where(eq(invites.id, id));
}

export async function listOrganizations() {
  return db.select().from(organizations).where(eq(organizations.isActive, true));
}

export async function createOrganization(input: { name: string; type: 'bees_internal' | 'wholesaler' }) {
  const [org] = await db.insert(organizations).values(input).returning();
  return org;
}
