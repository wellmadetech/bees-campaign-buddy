export interface Template {
  id: string;
  name: string;
  campaignTypeId: string;
  brazeTemplateId: string | null;
  channel: TemplateChannel;
  contentJson: Record<string, unknown>;
  thumbnailUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TemplateChannel = 'push' | 'email' | 'in_app' | 'content_card' | 'sms' | 'whatsapp' | 'webhook';
