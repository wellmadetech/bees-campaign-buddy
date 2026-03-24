import { pgTable, pgEnum, uuid, varchar, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { campaigns } from './campaigns.js';

export const orchestrationStepEnum = pgEnum('orchestration_step', [
  'validate',
  'match_template',
  'discover_assets',
  'create_audience',
  'create_braze_draft',
]);

export const jobStatusEnum = pgEnum('job_status', [
  'pending',
  'running',
  'success',
  'failed',
  'retrying',
]);

export const orchestrationJobs = pgTable('orchestration_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id')
    .notNull()
    .references(() => campaigns.id),
  step: orchestrationStepEnum('step').notNull(),
  status: jobStatusEnum('status').default('pending').notNull(),
  attempt: integer('attempt').default(0).notNull(),
  inputJson: jsonb('input_json'),
  outputJson: jsonb('output_json'),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
