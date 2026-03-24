import { Router } from 'express';
import { ssoCallback, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/sso/callback', ssoCallback);
router.get('/me', authenticate, getMe);

export default router;
