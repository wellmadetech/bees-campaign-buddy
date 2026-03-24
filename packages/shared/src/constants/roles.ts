export const UserRole = {
  WHOLESALER_MANAGER: 'wholesaler_manager',
  CONTENT_CREATOR: 'content_creator',
  DC_MANAGER: 'dc_manager',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ROLE_LABELS: Record<UserRole, string> = {
  wholesaler_manager: 'Wholesaler Manager',
  content_creator: 'Content Creator & UX',
  dc_manager: 'DC Manager',
};
