import { pgTable, uuid, varchar, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const templates = pgTable('templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  campaignTypeId: uuid('campaign_type_id'),
  brazeTemplateId: varchar('braze_template_id', { length: 255 }),
  channel: varchar('channel', { length: 50 }).notNull(),
  contentJson: jsonb('content_json').notNull().$type<Record<string, unknown>>(),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
