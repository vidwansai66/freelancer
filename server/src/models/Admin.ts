export interface IAdmin {
  id: string;
  email: string;
  fullName: string;
  role: 'superadmin' | 'admin';
  lastLogin?: Date;
}
