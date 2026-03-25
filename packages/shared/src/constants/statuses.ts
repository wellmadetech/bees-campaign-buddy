// Campaign Request statuses (before acceptance)
export const RequestStatus = {
  IN_REVIEW: 'in_review',
  DENIED: 'denied',
  ACCEPTED: 'accepted',
} as const;

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  in_review: 'In Review',
  denied: 'Denied',
  accepted: 'Accepted',
};

// Campaign statuses (after acceptance)
export const CampaignStatus = {
  IN_PROGRESS: 'in_progress',
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  NEEDS_ATTENTION: 'needs_attention',
  CANCELLED: 'cancelled',
} as const;

export type CampaignStatus = (typeof CampaignStatus)[keyof typeof CampaignStatus];

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  in_progress: 'In Progress',
  scheduled: 'Scheduled',
  active: 'Active',
  completed: 'Completed',
  needs_attention: 'Needs Attention',
  cancelled: 'Cancelled',
};

export const ALLOWED_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  in_progress: ['scheduled', 'needs_attention', 'cancelled'],
  scheduled: ['active', 'needs_attention', 'cancelled'],
  active: ['completed', 'needs_attention', 'cancelled'],
  completed: [],
  needs_attention: ['in_progress', 'cancelled'],
  cancelled: [],
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
