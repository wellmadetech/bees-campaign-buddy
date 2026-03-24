import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { getUserBySsoId, getUserById } from '../services/user.service.js';
import { db } from '../db/client.js';
import { userBranches } from '../db/schema/users.js';
import { eq } from 'drizzle-orm';

// For dev: generate a token for a user by SSO ID (simulates SSO callback)
export async function ssoCallback(req: Request, res: Response) {
  const { ssoId } = req.body;

  if (!ssoId) {
    res.status(400).json({ message: 'ssoId is required' });
    return;
  }

  const user = await getUserBySsoId(ssoId);
  if (!user) {
    res.status(404).json({ message: 'User not found. Contact your DC Manager.' });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ message: 'Account is deactivated' });
    return;
  }

  const ubs = await db
    .select({ branchId: userBranches.branchId })
    .from(userBranches)
    .where(eq(userBranches.userId, user.id));

  const branchIds = ubs.map((ub) => ub.branchId);

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      branchIds,
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN as string & jwt.SignOptions['expiresIn'] },
  );

  res.json({
    data: {
      accessToken: token,
      expiresIn: 900,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        branchIds,
      },
    },
  });
}

export async function getMe(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const user = await getUserById(req.user.userId);
  res.json({ data: user });
}
