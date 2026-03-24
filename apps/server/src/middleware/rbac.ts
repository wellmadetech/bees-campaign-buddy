import { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@campaignbuddy/shared';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

export function requireBranchAccess(branchIdExtractor?: (req: Request) => string | undefined) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // DC Managers have access to all branches
    if (req.user.role === 'dc_manager') {
      next();
      return;
    }

    const branchId = branchIdExtractor
      ? branchIdExtractor(req)
      : req.params.branchId || req.body?.branchId;

    if (branchId && !req.user.branchIds.includes(branchId)) {
      res.status(403).json({ message: 'Access denied to this branch' });
      return;
    }

    next();
  };
}
