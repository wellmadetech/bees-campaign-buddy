export interface BrazeCampaignCreateParams {
  name: string;
  description?: string;
  schedule_type: 'scheduled' | 'action_based' | 'api_triggered';
  start_time?: string;
  end_time?: string;
  messages: BrazeMessages;
  segment_id?: string;
  tags?: string[];
}

export interface BrazeMessages {
  apple_push?: BrazePushMessage;
  android_push?: BrazePushMessage;
  email?: BrazeEmailMessage;
  in_app_message?: BrazeInAppMessage;
}

export interface BrazePushMessage {
  alert: string;
  title?: string;
  extra?: Record<string, string>;
  deep_link?: string;
  image_url?: string;
}

export interface BrazeEmailMessage {
  subject: string;
  from: string;
  body: string;
  preheader?: string;
  reply_to?: string;
}

export interface BrazeInAppMessage {
  type: 'slideup' | 'modal' | 'full';
  message: string;
  header?: string;
  image_url?: string;
  buttons?: { text: string; uri?: string }[];
}

export interface BrazeCampaignResponse {
  campaign_id: string;
  message: string;
}

export interface BrazeCampaignDetails {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'active' | 'stopped' | 'archived';
  created_at: string;
  updated_at: string;
  tags: string[];
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
}

export interface BrazeSegmentCreateParams {
  name: string;
  filters: BrazeSegmentFilter[];
}

export interface BrazeSegmentFilter {
  custom_attribute_name?: string;
  value?: string | number | boolean;
  comparison?: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
}

export interface BrazeSegmentResponse {
  segment_id: string;
  message: string;
}

export interface BrazeTemplateInfo {
  template_id: string;
  template_name: string;
  subject?: string;
  body: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface BrazeWebhookPayload {
  event_type: 'campaign.send' | 'campaign.stop' | 'campaign.status_change';
  campaign_id: string;
  status?: string;
  timestamp: string;
  data?: Record<string, unknown>;
}
