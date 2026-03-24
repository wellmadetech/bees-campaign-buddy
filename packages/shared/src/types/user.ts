import type { UserRole } from '../constants/roles.js';

export interface User {
  id: string;
  besSsoId: string;
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithBranches extends User {
  branches: UserBranch[];
}

export interface UserBranch {
  branchId: string;
  branchName: string;
  branchCode: string;
  isPrimary: boolean;
}

export interface CreateUserRequest {
  email: string;
  displayName: string;
  role: UserRole;
  branchIds: string[];
  primaryBranchId?: string;
}

export interface UpdateUserRequest {
  displayName?: string;
  role?: UserRole;
  branchIds?: string[];
  primaryBranchId?: string;
  isActive?: boolean;
}
