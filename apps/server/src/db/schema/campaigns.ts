import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { branches } from './branches.js';
import { templates } from './templates.js';

export const campaignTypeCodeEnum = pgEnum('campaign_type_code', [
  'ad_hoc_sales',
  'ad_hoc_operational',
  'opt_in',
  'edge_algo',
  'lifecycle',
]);

export const campaignStatusEnum = pgEnum('campaign_status', [
  'in_progress',
  'scheduled',
  'active',
  'completed',
  'needs_attention',
  'cancelled',
]);

export const requestStatusEnum = pgEnum('request_status', [
  'in_review',
  'denied',
  'accepted',
]);

export const campaignTypes = pgTable('campaign_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: campaignTypeCodeEnum('code').notNull().unique(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  description: text('description'),
  defaultTemplateId: uuid('default_template_id').references(() => templates.id),
  isActive: boolean('is_active').default(true).notNull(),
});

export const campaigns = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  campaignTypeId: uuid('campaign_type_id')
    .notNull()
    .references(() => campaignTypes.id),
  templateId: uuid('template_id').references(() => templates.id),
  branchId: uuid('branch_id')
    .notNull()
    .references(() => branches.id),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  assignedTo: uuid('assigned_to').references(() => users.id),
  status: campaignStatusEnum('status').default('in_progress').notNull(),
  parentId: uuid('parent_id'),
  scheduledStart: timestamp('scheduled_start', { withTimezone: true }),
  scheduledEnd: timestamp('scheduled_end', { withTimezone: true }),
  contentJson: jsonb('content_json'),
  creativeJson: jsonb('creative_json'),
  productsJson: jsonb('products_json'),
  brazeCampaignId: varchar('braze_campaign_id', { length: 255 }),
  brazeSegmentId: varchar('braze_segment_id', { length: 255 }),
  brazeStatus: varchar('braze_status', { length: 50 }),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const campaignStatusHistory = pgTable('campaign_status_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id')
    .notNull()
    .references(() => campaigns.id, { onDelete: 'cascade' }),
  fromStatus: campaignStatusEnum('from_status'),
  toStatus: campaignStatusEnum('to_status').notNull(),
  changedBy: uuid('changed_by').references(() => users.id),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
