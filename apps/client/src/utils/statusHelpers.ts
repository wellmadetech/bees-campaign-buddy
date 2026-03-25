import type { CampaignStatus } from '@campaignbuddy/shared';

const STATUS_STYLES: Record<string, string> = {
  // Campaign statuses
  in_progress: 'badge-brand',
  scheduled: 'badge-info',
  active: 'badge-success',
  completed: 'badge-default',
  needs_attention: 'badge-danger',
  cancelled: 'badge-default',
  // Request statuses
  in_review: 'badge-warn',
  denied: 'badge-danger',
  accepted: 'badge-success',
};

export function getStatusStyle(status: string): string {
  return STATUS_STYLES[status] ?? 'badge-default';
}
