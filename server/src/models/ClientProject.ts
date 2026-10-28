export interface IClientProject {
  id: string;
  sourceType: string;
  sourceId: string;
  title: string;
  clientName: string;
  clientEmail: string;
  proposal?: string;
  quoteAmount?: number;
  status: string;
  meetingLink?: string;
  tokenHash: string;
  documents: string[];
  updates?: Array<{ text: string; at: string }>;
  createdAt: Date;
}

