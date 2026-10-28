export interface IFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
}
