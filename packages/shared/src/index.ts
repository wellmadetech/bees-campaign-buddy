// Constants
export { UserRole, ROLE_LABELS } from './constants/roles.js';
export { CampaignTypeCode, CAMPAIGN_TYPE_LABELS, CAMPAIGN_TYPE_DESCRIPTIONS } from './constants/campaignTypes.js';
export { CampaignStatus, STATUS_LABELS, ALLOWED_TRANSITIONS, RequestStatus, REQUEST_STATUS_LABELS, OrchestrationStep, JobStatus } from './constants/statuses.js';

// Types
export type { User, UserWithBranches, UserBranch, CreateUserRequest, UpdateUserRequest } from './types/user.js';
export type { Branch } from './types/branch.js';
export type { Campaign, CampaignContent, CampaignCreative, ProductSelection, CreateCampaignRequest, UpdateCampaignRequest, TransitionCampaignRequest, CampaignStatusHistoryEntry, CampaignListFilters } from './types/campaign.js';
export type { Template, TemplateChannel } from './types/template.js';
export type { Audience, AudienceCriteria, AudienceFilter, CreateAudienceRequest, AudienceEstimateResponse } from './types/audience.js';
export type { ApiResponse, PaginatedResponse, ApiError, AuthTokens, AuthUser } from './types/api.js';
export type {
  TouchpointChannel, ConversionType, EventType, AttributionModel,
  AnalyticsFilters, ChannelMixResult, FunnelStep, FunnelSequence,
  ChannelAttribution, CampaignMetricsSummary, CampaignMetricsTimeSeries,
  AnalyticsOverview,
} from './types/analytics.js';

// Validators
export { createUserSchema, updateUserSchema } from './validators/userSchema.js';
export type { CreateUserInput, UpdateUserInput } from './validators/userSchema.js';
export { createCampaignSchema, updateCampaignSchema, transitionCampaignSchema, createAudienceSchema } from './validators/campaignSchema.js';
export type { CreateCampaignInput, UpdateCampaignInput, TransitionCampaignInput, CreateAudienceInput } from './validators/campaignSchema.js';
