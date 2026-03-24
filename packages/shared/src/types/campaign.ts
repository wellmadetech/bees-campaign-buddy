import type { CampaignStatus } from '../constants/statuses.js';
import type { CampaignTypeCode } from '../constants/campaignTypes.js';

export interface Campaign {
  id: string;
  title: string;
  description: string | null;
  campaignTypeId: string;
  campaignTypeCode: CampaignTypeCode;
  templateId: string | null;
  branchId: string;
  branchName: string;
  createdBy: string;
  createdByName: string;
  assignedTo: string | null;
  assignedToName: string | null;
  status: CampaignStatus;
  parentId: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  contentJson: CampaignContent | null;
  creativeJson: CampaignCreative | null;
  productsJson: ProductSelection[] | null;
  brazeCampaignId: string | null;
  brazeSegmentId: string | null;
  brazeStatus: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignContent {
  headline?: string;
  body?: string;
  cta?: string;
  preheader?: string;
  subject?: string;
}

export interface CampaignCreative {
  imageUrls?: string[];
  deepLinks?: string[];
  bannerUrl?: string;
  thumbnailUrl?: string;
}

export interface ProductSelection {
  sku: string;
  name: string;
  category?: string;
  imageUrl?: string;
  deepLink?: string;
}

export interface CreateCampaignRequest {
  title: string;
  description?: string;
  campaignTypeCode: CampaignTypeCode;
  templateId?: string;
  branchId: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  contentJson?: CampaignContent;
  creativeJson?: CampaignCreative;
  productsJson?: ProductSelection[];
}

export interface UpdateCampaignRequest {
  title?: string;
  description?: string;
  templateId?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  contentJson?: CampaignContent;
  creativeJson?: CampaignCreative;
  productsJson?: ProductSelection[];
}

export interface TransitionCampaignRequest {
  to: CampaignStatus;
  notes?: string;
}

export interface CampaignStatusHistoryEntry {
  id: string;
  campaignId: string;
  fromStatus: CampaignStatus | null;
  toStatus: CampaignStatus;
  changedBy: string | null;
  changedByName: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CampaignListFilters {
  branchId?: string;
  status?: CampaignStatus;
  campaignTypeCode?: CampaignTypeCode;
  createdBy?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
