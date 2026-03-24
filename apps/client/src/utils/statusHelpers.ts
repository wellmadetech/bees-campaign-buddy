import type { CampaignStatus } from '@campaignbuddy/shared';

const STATUS_STYLES: Record<CampaignStatus, string> = {
  draft: 'badge-default',
  submitted: 'badge-info',
  picked_up: 'badge-info',
  in_progress: 'badge-brand',
  in_qa: 'badge-warn',
  feedback_needed: 'badge-danger',
  approved: 'badge-success',
  launched: 'badge-success',
  paused: 'badge-warn',
  cancelled: 'badge-default',
  completed: 'badge-default',
};

export function getStatusStyle(status: string): string {
  return STATUS_STYLES[status as CampaignStatus] ?? 'badge-default';
}
