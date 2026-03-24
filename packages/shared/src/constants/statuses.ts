export const CampaignStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  PICKED_UP: 'picked_up',
  IN_PROGRESS: 'in_progress',
  IN_QA: 'in_qa',
  FEEDBACK_NEEDED: 'feedback_needed',
  APPROVED: 'approved',
  LAUNCHED: 'launched',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export type CampaignStatus = (typeof CampaignStatus)[keyof typeof CampaignStatus];

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  picked_up: 'Picked Up',
  in_progress: 'In Progress',
  in_qa: 'In QA',
  feedback_needed: 'Feedback Needed',
  approved: 'Approved',
  launched: 'Launched',
  paused: 'Paused',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

export const ALLOWED_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['picked_up', 'cancelled'],
  picked_up: ['in_progress', 'cancelled'],
  in_progress: ['in_qa', 'feedback_needed', 'cancelled'],
  in_qa: ['approved', 'feedback_needed', 'cancelled'],
  feedback_needed: ['in_progress', 'cancelled'],
  approved: ['launched', 'cancelled'],
  launched: ['paused', 'completed'],
  paused: ['launched', 'cancelled'],
  cancelled: [],
  completed: [],
};

export const OrchestrationStep = {
  VALIDATE: 'validate',
  MATCH_TEMPLATE: 'match_template',
  DISCOVER_ASSETS: 'discover_assets',
  CREATE_AUDIENCE: 'create_audience',
  CREATE_BRAZE_DRAFT: 'create_braze_draft',
} as const;

export type OrchestrationStep = (typeof OrchestrationStep)[keyof typeof OrchestrationStep];

export const JobStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
  RETRYING: 'retrying',
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];
