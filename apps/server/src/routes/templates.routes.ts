import { Router } from 'express';
import * as templatesController from '../controllers/templates.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/', templatesController.list);
router.get('/:id', templatesController.getById);

// Only content creators and DC managers can manage templates
router.post('/', requireRole('content_creator', 'dc_manager'), templatesController.create);
router.patch('/:id', requireRole('content_creator', 'dc_manager'), templatesController.update);
router.delete('/:id', requireRole('content_creator', 'dc_manager'), templatesController.remove);

export default router;
