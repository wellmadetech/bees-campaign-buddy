export interface Audience {
  id: string;
  campaignId: string;
  name: string;
  criteriaJson: AudienceCriteria;
  brazeSegmentId: string | null;
  estimatedSize: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AudienceCriteria {
  filters: AudienceFilter[];
  logic: 'AND' | 'OR';
}

export interface AudienceFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in' | 'gt' | 'lt' | 'between';
  value: string | string[] | number | [number, number];
}

export interface CreateAudienceRequest {
  name: string;
  criteriaJson: AudienceCriteria;
}

export interface AudienceEstimateResponse {
  estimatedSize: number;
  criteria: AudienceCriteria;
}
