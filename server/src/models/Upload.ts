export interface IUpload {
  id: string;
  filename: string;
  mime: string;
  size: number;
  visibility: 'public' | 'private';
  claimHash: string;
  owner?: string;
  expiresAt?: Date;
  createdAt: Date;
}
