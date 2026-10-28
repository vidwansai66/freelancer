export interface IProject {
  id: string;
  title: string;
  slug: string;
  category: string;
  clientName: string;
  resultStat: string;
  featuredImage: string;
  galleryImages: string[];
  liveUrl?: string;
  githubUrl?: string;
  technologies: string[];
  caseStudyMarkdown?: string;
  isFeatured: boolean;
  orderIndex: number;
  createdAt: Date;
}
