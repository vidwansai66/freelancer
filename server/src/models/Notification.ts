export interface INotification {
  id: string;
  to: string;
  subject: string;
  referenceId?: string;
  status: 'deferred' | 'sent' | 'failed';
  error?: string;
  createdAt: Date;
}
