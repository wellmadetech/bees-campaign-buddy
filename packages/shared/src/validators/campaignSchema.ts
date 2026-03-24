import { z } from 'zod';

const contentJsonSchema = z.object({
  headline: z.string().optional(),
  body: z.string().optional(),
  cta: z.string().optional(),
  preheader: z.string().optional(),
  subject: z.string().optional(),
});

const creativeJsonSchema = z.object({
  imageUrls: z.array(z.string().url()).optional(),
  deepLinks: z.array(z.string()).optional(),
  bannerUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
});

const productSelectionSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
  deepLink: z.string().optional(),
});

export const createCampaignSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  campaignTypeCode: z.enum([
    'ad_hoc_sales',
    'ad_hoc_operational',
    'opt_in',
    'edge_algo',
    'lifecycle',
  ]),
  templateId: z.string().uuid().optional(),
  branchId: z.string().uuid(),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
  contentJson: contentJsonSchema.optional(),
  creativeJson: creativeJsonSchema.optional(),
  productsJson: z.array(productSelectionSchema).optional(),
});

export const updateCampaignSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  templateId: z.string().uuid().optional(),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
  contentJson: contentJsonSchema.optional(),
  creativeJson: creativeJsonSchema.optional(),
  productsJson: z.array(productSelectionSchema).optional(),
});

export const transitionCampaignSchema = z.object({
  to: z.enum([
    'draft',
    'submitted',
    'picked_up',
    'in_progress',
    'in_qa',
    'feedback_needed',
    'approved',
    'launched',
    'paused',
    'cancelled',
    'completed',
  ]),
  notes: z.string().max(1000).optional(),
});

const audienceFilterSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['equals', 'not_equals', 'contains', 'in', 'not_in', 'gt', 'lt', 'between']),
  value: z.union([z.string(), z.array(z.string()), z.number(), z.tuple([z.number(), z.number()])]),
});

export const createAudienceSchema = z.object({
  name: z.string().min(1).max(255),
  criteriaJson: z.object({
    filters: z.array(audienceFilterSchema).min(1),
    logic: z.enum(['AND', 'OR']),
  }),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type TransitionCampaignInput = z.infer<typeof transitionCampaignSchema>;
export type CreateAudienceInput = z.infer<typeof createAudienceSchema>;
