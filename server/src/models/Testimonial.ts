export interface ITestimonial {
  id: string;
  clientName: string;
  company: string;
  role: string;
  avatarUrl: string;
  rating: number;
  reviewText: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: Date;
}
