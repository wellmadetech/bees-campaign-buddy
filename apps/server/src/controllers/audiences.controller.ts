import { Request, Response, NextFunction } from 'express';
import * as audienceService from '../services/audience.service.js';

export async function getByCampaignId(req: Request, res: Response, next: NextFunction) {
  try {
    const audience = await audienceService.getAudienceByCampaignId(String(req.params.campaignId));
    res.json({ data: audience });
  } catch (err) {
    next(err);
  }
}

export async function createOrUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const audience = await audienceService.createOrUpdateAudience(
      String(req.params.campaignId),
      req.body,
    );
    res.json({ data: audience });
  } catch (err) {
    next(err);
  }
}

export async function estimate(req: Request, res: Response, next: NextFunction) {
  try {
    const estimatedSize = await audienceService.estimateAudienceSize(req.body.criteriaJson);
    res.json({ data: { estimatedSize, criteria: req.body.criteriaJson } });
  } catch (err) {
    next(err);
  }
}

export async function listSaved(req: Request, res: Response, next: NextFunction) {
  try {
    const audiences = await audienceService.listSavedAudiences();
    res.json({ data: audiences });
  } catch (err) {
    next(err);
  }
}
