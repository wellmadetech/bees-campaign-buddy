import { Router, Request, Response, NextFunction } from 'express';
import * as inviteService from '../services/invite.service.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Public: validate invite token (for onboarding page)
router.get('/validate/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invite = await inviteService.getInviteByToken(String(req.params.token));
    res.json({ data: invite });
  } catch (err) {
    next(err);
  }
});

// Public: accept invite
router.post('/accept/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invite = await inviteService.acceptInvite(String(req.params.token));
    res.json({ data: invite });
  } catch (err) {
    next(err);
  }
});

// Protected: manage invites (DC Manager only)
router.use(authenticate);
router.use(requireRole('dc_manager'));

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invites = await inviteService.listInvites({ status: req.query.status as string });
    res.json({ data: invites });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invite = await inviteService.createInvite({
      ...req.body,
      invitedBy: req.user!.userId,
    });
    res.status(201).json({ data: invite });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await inviteService.revokeInvite(String(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Organizations
router.get('/organizations', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const orgs = await inviteService.listOrganizations();
    res.json({ data: orgs });
  } catch (err) {
    next(err);
  }
});

router.post('/organizations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await inviteService.createOrganization(req.body);
    res.status(201).json({ data: org });
  } catch (err) {
    next(err);
  }
});

export default router;
