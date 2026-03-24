export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  branchIds: string[];
}
