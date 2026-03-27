import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  integer,
  numeric,
  date,
  timestamp,
  jsonb,
  unique,
} from 'drizzle-orm/pg-core';
import { campaigns } from './campaigns.js';
import { branches } from './branches.js';

export const touchpointChannelEnum = pgEnum('touchpoint_channel', [
  'push',
  'email',
  'in_app',
  'content_card',
  'sms',
  'whatsapp',
]);

export const touchpointEvents = pgTable('touchpoint_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id')
    .notNull()
    .references(() => campaigns.id),
  branchId: uuid('branch_id')
    .notNull()
    .references(() => branches.id),
  channel: touchpointChannelEnum('channel').notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  pocId: varchar('poc_id', { length: 255 }).notNull(),
  sequencePosition: integer('sequence_position').notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  metadataJson: jsonb('metadata_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const conversions = pgTable('conversions', {
  id: uuid('id').defaultRandom().primaryKey(),
  pocId: varchar('poc_id', { length: 255 }).notNull(),
  campaignId: uuid('campaign_id').references(() => campaigns.id),
  branchId: uuid('branch_id')
    .notNull()
    .references(() => branches.id),
  conversionType: varchar('conversion_type', { length: 50 }).notNull(),
  revenue: numeric('revenue', { precision: 12, scale: 2 }),
  productSku: varchar('product_sku', { length: 100 }),
  productName: varchar('product_name', { length: 255 }),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  attributionJson: jsonb('attribution_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const campaignMetrics = pgTable(
  'campaign_metrics',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id),
    branchId: uuid('branch_id')
      .notNull()
      .references(() => branches.id),
    channel: touchpointChannelEnum('channel').notNull(),
    date: date('date').notNull(),
    sent: integer('sent').default(0).notNull(),
    delivered: integer('delivered').default(0).notNull(),
    opened: integer('opened').default(0).notNull(),
    clicked: integer('clicked').default(0).notNull(),
    conversions: integer('conversions').default(0).notNull(),
    revenue: numeric('revenue', { precision: 12, scale: 2 }).default('0').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('campaign_metrics_unique').on(table.campaignId, table.channel, table.date),
  ]
);
