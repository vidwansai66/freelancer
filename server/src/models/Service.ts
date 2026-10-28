export interface IService {
  id: string;
  isPublished: boolean;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  deliverables: string[];
  startingPrice: number;
  isFeatured: boolean;
  orderIndex: number;
  createdAt: Date;
}
