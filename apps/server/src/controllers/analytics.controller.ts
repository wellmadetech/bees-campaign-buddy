import { Request, Response, NextFunction } from 'express';
import type { AnalyticsFilters, TouchpointChannel, AttributionModel } from '@campaignbuddy/shared';
import * as analyticsService from '../services/analytics/analyticsService.js';

function parseFilters(req: Request): AnalyticsFilters {
  return {
    branchId: req.query.branchId as string | undefined,
    campaignId: req.query.campaignId as string | undefined,
    dateFrom: req.query.dateFrom as string | undefined,
    dateTo: req.query.dateTo as string | undefined,
    channels: req.query.channels
      ? (req.query.channels as string).split(',') as TouchpointChannel[]
      : undefined,
    model: (req.query.model as AttributionModel) || undefined,
    granularity: (req.query.granularity as 'daily' | 'weekly' | 'monthly') || undefined,
  };
}

export async function overview(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getOverview(parseFilters(req));
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function channelMix(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getChannelMix(parseFilters(req));
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function funnel(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getFunnel(parseFilters(req));
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function attribution(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getAttribution(parseFilters(req));
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function campaignMetrics(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getCampaignMetricsAggregated(parseFilters(req));
    res.json({ data });
  } catch (err) {
    next(err);
  }
}
