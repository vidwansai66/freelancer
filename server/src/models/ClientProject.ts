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
  tokenHash: string;
  documents: string[];
  createdAt: Date;
}
