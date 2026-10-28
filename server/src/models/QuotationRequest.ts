export interface IQuotationRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  businessType?: string;
  projectType: string;
  budgetRange: string;
  timeline: string;
  requiredFeatures: string[];
  description: string;
  status: 'new' | 'reviewed' | 'quoted' | 'declined';
  estimatedQuote?: number;
  notes?: string;
  proposal?: string;
  attachments?: string[];
  createdAt: Date;
}
