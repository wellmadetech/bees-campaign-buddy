import type {
  BrazeCampaignCreateParams,
  BrazeSegmentCreateParams,
  BrazeSegmentFilter,
} from './types.js';

interface CampaignData {
  title: string;
  description: string | null;
  contentJson: { headline?: string; body?: string; cta?: string; subject?: string; preheader?: string } | null;
  creativeJson: { imageUrls?: string[]; deepLinks?: string[] } | null;
  scheduledStart: Date | string | null;
  scheduledEnd: Date | string | null;
  brazeSegmentId?: string | null;
}

interface AudienceData {
  name: string;
  criteriaJson: {
    filters: { field: string; operator: string; value: unknown }[];
    logic: 'AND' | 'OR';
  };
}

export function mapCampaignToBraze(campaign: CampaignData): BrazeCampaignCreateParams {
  const content = campaign.contentJson;
  const creative = campaign.creativeJson;

  const pushMessage = content
    ? {
        alert: content.body ?? '',
        title: content.headline,
        deep_link: creative?.deepLinks?.[0],
        image_url: creative?.imageUrls?.[0],
      }
    : undefined;

  const emailMessage = content?.subject
    ? {
        subject: content.subject,
        from: 'BEES Campaign Buddy <noreply@bees.com>',
        body: `<h1>${content.headline ?? ''}</h1><p>${content.body ?? ''}</p>`,
        preheader: content.preheader,
      }
    : undefined;

  return {
    name: campaign.title,
    description: campaign.description ?? undefined,
    schedule_type: campaign.scheduledStart ? 'scheduled' : 'api_triggered',
    start_time: campaign.scheduledStart
      ? new Date(campaign.scheduledStart).toISOString()
      : undefined,
    end_time: campaign.scheduledEnd
      ? new Date(campaign.scheduledEnd).toISOString()
      : undefined,
    messages: {
      ...(pushMessage ? { apple_push: pushMessage, android_push: pushMessage } : {}),
      ...(emailMessage ? { email: emailMessage } : {}),
    },
    segment_id: campaign.brazeSegmentId ?? undefined,
    tags: ['campaign-buddy', 'automated'],
  };
}

export function mapAudienceToBrazeSegment(audience: AudienceData): BrazeSegmentCreateParams {
  const filters: BrazeSegmentFilter[] = audience.criteriaJson.filters.map((f) => ({
    custom_attribute_name: f.field,
    value: f.value as string | number | boolean,
    comparison: mapOperator(f.operator),
  }));

  return {
    name: `CB_${audience.name}_${Date.now()}`,
    filters,
  };
}

function mapOperator(op: string): BrazeSegmentFilter['comparison'] {
  const mapping: Record<string, BrazeSegmentFilter['comparison']> = {
    equals: 'equals',
    not_equals: 'not_equals',
    gt: 'greater_than',
    lt: 'less_than',
    contains: 'contains',
  };
  return mapping[op] ?? 'equals';
}

export function mapBrazeStatusToInternal(brazeStatus: string): string {
  const mapping: Record<string, string> = {
    draft: 'in_progress',
    scheduled: 'approved',
    active: 'launched',
    stopped: 'paused',
    archived: 'completed',
  };
  return mapping[brazeStatus] ?? brazeStatus;
}
