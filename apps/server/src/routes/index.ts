import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import branchesRoutes from './branches.routes.js';
import campaignsRoutes from './campaigns.routes.js';
import templatesRoutes from './templates.routes.js';
import audiencesRoutes from './audiences.routes.js';
import webhooksRoutes from './webhooks.routes.js';
import invitesRoutes from './invites.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/invites', invitesRoutes);
router.use('/branches', branchesRoutes);
router.use('/campaigns', campaignsRoutes);
router.use('/templates', templatesRoutes);
router.use('/audiences', audiencesRoutes);
router.use('/webhooks', webhooksRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
