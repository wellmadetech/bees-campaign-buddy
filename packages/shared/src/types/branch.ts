export interface Branch {
  id: string;
  name: string;
  code: string;
  region: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
