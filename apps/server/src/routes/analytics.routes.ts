import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as analyticsController from '../controllers/analytics.controller.js';

const router = Router();

router.use(authenticate);

router.get('/overview', analyticsController.overview);
router.get('/channel-mix', analyticsController.channelMix);
router.get('/funnel', analyticsController.funnel);
router.get('/attribution', analyticsController.attribution);
router.get('/campaign-metrics', analyticsController.campaignMetrics);

export default router;
