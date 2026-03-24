import { Router } from 'express';
import * as audiencesController from '../controllers/audiences.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validateBody.js';
import { createAudienceSchema } from '@campaignbuddy/shared';

const router = Router();

router.use(authenticate);

router.get('/saved', audiencesController.listSaved);
router.post('/estimate', audiencesController.estimate);
router.get('/campaigns/:campaignId', audiencesController.getByCampaignId);
router.post('/campaigns/:campaignId', validate(createAudienceSchema), audiencesController.createOrUpdate);

export default router;
