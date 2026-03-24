import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { authenticate } from '../middleware/auth.js';
import { db } from '../db/client.js';
import { branches } from '../db/schema/branches.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const allBranches = await db
      .select()
      .from(branches)
      .where(eq(branches.isActive, true));

    // Scope to user's branches unless DC Manager
    const data =
      req.user!.role === 'dc_manager'
        ? allBranches
        : allBranches.filter((b) => req.user!.branchIds.includes(b.id));

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [branch] = await db
      .select()
      .from(branches)
      .where(eq(branches.id, req.params.id));
    if (!branch) {
      res.status(404).json({ message: 'Branch not found' });
      return;
    }
    res.json({ data: branch });
  } catch (err) {
    next(err);
  }
});

export default router;
