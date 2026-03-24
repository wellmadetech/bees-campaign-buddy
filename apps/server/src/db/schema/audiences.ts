import { pgTable, uuid, varchar, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { campaigns } from './campaigns.js';

export const audiences = pgTable('audiences', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id')
    .notNull()
    .references(() => campaigns.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  criteriaJson: jsonb('criteria_json').notNull(),
  brazeSegmentId: varchar('braze_segment_id', { length: 255 }),
  estimatedSize: integer('estimated_size'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
