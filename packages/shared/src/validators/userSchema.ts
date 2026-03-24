import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(255),
  role: z.enum(['wholesaler_manager', 'content_creator', 'dc_manager']),
  branchIds: z.array(z.string().uuid()).min(1),
  primaryBranchId: z.string().uuid().optional(),
});

export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(255).optional(),
  role: z.enum(['wholesaler_manager', 'content_creator', 'dc_manager']).optional(),
  branchIds: z.array(z.string().uuid()).min(1).optional(),
  primaryBranchId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
