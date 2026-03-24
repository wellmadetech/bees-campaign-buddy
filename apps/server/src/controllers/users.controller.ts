import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service.js';

function paramId(req: Request): string {
  return String(req.params.id);
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.listUsers(req.query as Record<string, string>);
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getUserById(paramId(req));
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const besSsoId = `sso-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const user = await userService.createUser({ ...req.body, besSsoId });
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateUser(paramId(req), req.body);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function deactivate(req: Request, res: Response, next: NextFunction) {
  try {
    await userService.deactivateUser(paramId(req));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
