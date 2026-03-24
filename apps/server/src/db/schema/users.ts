import { pgTable, pgEnum, uuid, varchar, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { branches } from './branches.js';

export const userRoleEnum = pgEnum('user_role', [
  'wholesaler_manager',
  'content_creator',
  'dc_manager',
]);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  besSsoId: varchar('bees_sso_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const userBranches = pgTable(
  'user_branches',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    branchId: uuid('branch_id')
      .notNull()
      .references(() => branches.id, { onDelete: 'cascade' }),
    isPrimary: boolean('is_primary').default(false).notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.branchId] })],
);
