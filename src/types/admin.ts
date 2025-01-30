export type AdminRole = 'superadmin' | 'admin';

export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  phone?: string;
  createdAt: string;
  createdBy?: string;
}

export interface CreateAdminData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: AdminRole;
}