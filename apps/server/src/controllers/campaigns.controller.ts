import { Request, Response, NextFunction } from 'express';
import * as campaignService from '../services/campaign.service.js';
import { runOrchestration, getOrchestrationJobs } from '../orchestration/engine.js';
import type { CampaignStatus } from '@campaignbuddy/shared';

function paramId(req: Request): string {
  return String(req.params.id);
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await campaignService.listCampaigns({
      branchId: req.query.branchId as string,
      status: req.query.status as string,
      campaignTypeCode: req.query.campaignTypeCode as string,
      createdBy: req.query.createdBy as string,
      search: req.query.search as string,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await campaignService.getCampaignById(paramId(req));
    res.json({ data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await campaignService.createCampaign(req.body, req.user!.userId);
    res.status(201).json({ data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await campaignService.updateCampaign(paramId(req), req.body);
    res.json({ data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function submit(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await campaignService.transitionCampaign(
      paramId(req),
      'submitted',
      req.user!.userId,
      'Campaign submitted for processing',
    );
    // Fire-and-forget orchestration pipeline
    void runOrchestration(paramId(req), req.user!.userId).catch((err) => {
      console.error('[Submit] Orchestration error:', err);
    });

    res.json({ data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function transition(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await campaignService.transitionCampaign(
      paramId(req),
      req.body.to as CampaignStatus,
      req.user!.userId,
      req.body.notes,
    );
    res.json({ data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function duplicate(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await campaignService.duplicateCampaign(
      paramId(req),
      req.user!.userId,
      req.body.targetBranchId,
    );
    res.status(201).json({ data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await campaignService.softDeleteCampaign(paramId(req));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function history(req: Request, res: Response, next: NextFunction) {
  try {
    const entries = await campaignService.getCampaignHistory(paramId(req));
    res.json({ data: entries });
  } catch (err) {
    next(err);
  }
}

export async function children(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await campaignService.getChildCampaigns(paramId(req));
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function linkParent(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await campaignService.linkParentCampaign(paramId(req), req.body.parentId);
    res.json({ data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function stats(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await campaignService.getCampaignStats();
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function orchestrationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const jobs = await getOrchestrationJobs(paramId(req));
    res.json({ data: jobs });
  } catch (err) {
    next(err);
  }
}
