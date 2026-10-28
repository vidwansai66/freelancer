export interface IInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  businessType?: string;
  service?: string;
  budget?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'archived';
  replyHistory?: Array<{ replyMessage: string; repliedBy: string; repliedAt: Date }>;
  createdAt: Date;
}
