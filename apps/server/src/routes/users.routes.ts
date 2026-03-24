import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validateBody.js';
import { createUserSchema, updateUserSchema } from '@campaignbuddy/shared';

const router = Router();

router.use(authenticate);
router.use(requireRole('dc_manager'));

router.get('/', usersController.list);
router.get('/:id', usersController.getById);
router.post('/', validate(createUserSchema), usersController.create);
router.patch('/:id', validate(updateUserSchema), usersController.update);
router.delete('/:id', usersController.deactivate);

export default router;
