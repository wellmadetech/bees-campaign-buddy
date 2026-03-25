import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { orchestrationJobs } from '../db/schema/orchestration.js';
import { campaigns, campaignStatusHistory } from '../db/schema/campaigns.js';
import { validateSubmission } from './steps/validateSubmission.js';
import { matchTemplate } from './steps/matchTemplate.js';
import { discoverAssets } from './steps/discoverAssets.js';
import { createAudience } from './steps/createAudience.js';
import { createBrazeDraft } from './steps/createBrazeDraft.js';
import type { OrchestrationStep } from '@campaignbuddy/shared';

const STEPS: { name: OrchestrationStep; fn: (campaignId: string) => Promise<Record<string, unknown>> }[] = [
  { name: 'validate', fn: validateSubmission },
  { name: 'match_template', fn: matchTemplate },
  { name: 'discover_assets', fn: discoverAssets },
  { name: 'create_audience', fn: createAudience },
  { name: 'create_braze_draft', fn: createBrazeDraft },
];

export async function runOrchestration(campaignId: string, userId?: string): Promise<void> {
  console.log(`[Orchestration] Starting pipeline for campaign ${campaignId}`);

  for (const step of STEPS) {
    // Create job record
    const [job] = await db
      .insert(orchestrationJobs)
      .values({
        campaignId,
        step: step.name,
        status: 'pending',
      })
      .returning();

    try {
      // Mark running
      await db
        .update(orchestrationJobs)
        .set({ status: 'running', startedAt: new Date() })
        .where(eq(orchestrationJobs.id, job!.id));

      console.log(`[Orchestration] Running step: ${step.name}`);

      // Execute step
      const output = await step.fn(campaignId);

      // Mark success
      await db
        .update(orchestrationJobs)
        .set({
          status: 'success',
          outputJson: output,
          completedAt: new Date(),
        })
        .where(eq(orchestrationJobs.id, job!.id));

      console.log(`[Orchestration] Step ${step.name} completed`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Mark failed
      await db
        .update(orchestrationJobs)
        .set({
          status: 'failed',
          errorMessage,
          completedAt: new Date(),
        })
        .where(eq(orchestrationJobs.id, job!.id));

      console.error(`[Orchestration] Step ${step.name} failed: ${errorMessage}`);

      // Transition campaign to needs_attention
      await db
        .update(campaigns)
        .set({ status: 'needs_attention', updatedAt: new Date() })
        .where(eq(campaigns.id, campaignId));

      await db.insert(campaignStatusHistory).values({
        campaignId,
        fromStatus: 'in_progress',
        toStatus: 'needs_attention',
        changedBy: userId,
        notes: `Orchestration failed at step "${step.name}": ${errorMessage}`,
      });

      return; // Halt pipeline
    }
  }

  // All steps passed — transition to scheduled
  await db
    .update(campaigns)
    .set({ status: 'scheduled', updatedAt: new Date() })
    .where(eq(campaigns.id, campaignId));

  await db.insert(campaignStatusHistory).values({
    campaignId,
    fromStatus: 'in_progress',
    toStatus: 'scheduled',
    changedBy: userId,
    notes: 'Orchestration pipeline completed — campaign ready for content review',
  });

  console.log(`[Orchestration] Pipeline completed for campaign ${campaignId}`);
}

export async function getOrchestrationJobs(campaignId: string) {
  return db
    .select()
    .from(orchestrationJobs)
    .where(eq(orchestrationJobs.campaignId, campaignId))
    .orderBy(orchestrationJobs.createdAt);
}
