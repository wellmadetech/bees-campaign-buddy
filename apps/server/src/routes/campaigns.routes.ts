import { Router } from 'express';
import * as campaignsController from '../controllers/campaigns.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireBranchAccess } from '../middleware/rbac.js';
import { validate } from '../middleware/validateBody.js';
import {
  createCampaignSchema,
  updateCampaignSchema,
  transitionCampaignSchema,
} from '@campaignbuddy/shared';

const router = Router();

router.use(authenticate);

// Stats / reporting
router.get('/stats', campaignsController.stats);

// CRUD
router.get('/', campaignsController.list);
router.get('/:id', campaignsController.getById);
router.post(
  '/',
  requireBranchAccess(),
  validate(createCampaignSchema),
  campaignsController.create,
);
router.patch('/:id', validate(updateCampaignSchema), campaignsController.update);
router.post('/:id/submit', campaignsController.submit);
router.post('/:id/transition', validate(transitionCampaignSchema), campaignsController.transition);
router.post('/:id/duplicate', campaignsController.duplicate);
router.delete('/:id', campaignsController.remove);

// Relationships
router.get('/:id/history', campaignsController.history);
router.get('/:id/children', campaignsController.children);
router.get('/:id/orchestration', campaignsController.orchestrationStatus);
router.post('/:id/parent', campaignsController.linkParent);

export default router;
