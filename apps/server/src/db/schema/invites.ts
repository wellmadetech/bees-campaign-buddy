import { pgTable, pgEnum, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const orgTypeEnum = pgEnum('org_type', ['bees_internal', 'wholesaler']);

export const inviteStatusEnum = pgEnum('invite_status', [
  'pending',
  'accepted',
  'expired',
  'revoked',
]);

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: orgTypeEnum('type').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const invites = pgTable('invites', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  invitedBy: uuid('invited_by'),
  token: varchar('token', { length: 255 }).notNull().unique(),
  status: inviteStatusEnum('status').default('pending').notNull(),
  message: text('message'),
  branchIds: text('branch_ids'), // JSON array of branch IDs
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
