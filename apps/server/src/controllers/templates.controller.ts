import { Request, Response, NextFunction } from 'express';
import * as templateService from '../services/template.service.js';

function paramId(req: Request): string {
  return String(req.params.id);
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const templates = await templateService.listTemplates({
      campaignTypeId: req.query.campaignTypeId as string,
      channel: req.query.channel as string,
    });
    res.json({ data: templates });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const template = await templateService.getTemplateById(paramId(req));
    res.json({ data: template });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const template = await templateService.createTemplate(req.body);
    res.status(201).json({ data: template });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const template = await templateService.updateTemplate(paramId(req), req.body);
    res.json({ data: template });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await templateService.deleteTemplate(paramId(req));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
