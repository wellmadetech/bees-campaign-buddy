import { eq, and, ilike } from 'drizzle-orm';
import { db } from '../db/client.js';
import { users, userBranches } from '../db/schema/index.js';
import { branches } from '../db/schema/branches.js';
import { AppError } from '../middleware/errorHandler.js';
import type { CreateUserInput, UpdateUserInput } from '@campaignbuddy/shared';

export async function listUsers(filters?: { branchId?: string; role?: string; search?: string }) {
  let query = db.select().from(users).where(eq(users.isActive, true));

  // For simplicity, return all active users. Filtering can be enhanced.
  const result = await query;

  // Enrich with branches
  const enriched = await Promise.all(
    result.map(async (user) => {
      const ubs = await db
        .select({
          branchId: userBranches.branchId,
          branchName: branches.name,
          branchCode: branches.code,
          isPrimary: userBranches.isPrimary,
        })
        .from(userBranches)
        .innerJoin(branches, eq(userBranches.branchId, branches.id))
        .where(eq(userBranches.userId, user.id));

      return { ...user, branches: ubs };
    }),
  );

  return enriched;
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user) throw new AppError(404, 'User not found');

  const ubs = await db
    .select({
      branchId: userBranches.branchId,
      branchName: branches.name,
      branchCode: branches.code,
      isPrimary: userBranches.isPrimary,
    })
    .from(userBranches)
    .innerJoin(branches, eq(userBranches.branchId, branches.id))
    .where(eq(userBranches.userId, user.id));

  return { ...user, branches: ubs };
}

export async function getUserBySsoId(ssoId: string) {
  const [user] = await db.select().from(users).where(eq(users.besSsoId, ssoId));
  return user ?? null;
}

export async function createUser(input: CreateUserInput & { besSsoId: string }) {
  const { branchIds, primaryBranchId, besSsoId, ...userData } = input;

  const [user] = await db
    .insert(users)
    .values({ ...userData, besSsoId })
    .returning();

  // Assign branches
  if (branchIds.length > 0) {
    await db.insert(userBranches).values(
      branchIds.map((branchId) => ({
        userId: user!.id,
        branchId,
        isPrimary: branchId === (primaryBranchId ?? branchIds[0]),
      })),
    );
  }

  return getUserById(user!.id);
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const { branchIds, primaryBranchId, ...userData } = input;

  if (Object.keys(userData).length > 0) {
    await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  if (branchIds) {
    await db.delete(userBranches).where(eq(userBranches.userId, id));
    if (branchIds.length > 0) {
      await db.insert(userBranches).values(
        branchIds.map((branchId) => ({
          userId: id,
          branchId,
          isPrimary: branchId === (primaryBranchId ?? branchIds[0]),
        })),
      );
    }
  }

  return getUserById(id);
}

export async function deactivateUser(id: string) {
  await db.update(users).set({ isActive: false, updatedAt: new Date() }).where(eq(users.id, id));
}
