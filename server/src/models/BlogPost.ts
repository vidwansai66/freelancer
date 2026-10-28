export interface IBlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
  readTimeMinutes: number;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
}
