export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'superadmin' | 'admin';
  lastLogin?: string;
}

export interface Service {
  isPublished: boolean;
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  deliverables: string[];
  startingPrice: number;
  isFeatured: boolean;
  orderIndex: number;
  createdAt: string;
}

export interface Project {
  _id: string;
  title: string;
  slug: string;
  category: string;
  clientName: string;
  industry?: string;
  resultStat: string;
  summary?: string;
  description?: string;
  objectives?: string;
  challenges?: string;
  solutions?: string;
  results?: string;
  featuredImage: string;
  galleryImages: string[];
  liveUrl?: string;
  githubUrl?: string;
  technologies: string[];
  servicesDelivered?: string[];
  caseStudyMarkdown?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: 'draft' | 'published';
  isFeatured: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PricingPlan {
  _id: string;
  name: string;
  slug: string;
  price: number;
  billingCycle: string;
  description: string;
  badge?: string;
  isPopular: boolean;
  features: string[];
  ctaText: string;
  orderIndex: number;
  isActive: boolean;
}

export interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'archived';
  replyHistory: {
    replyMessage: string;
    repliedBy: string;
    repliedAt: string;
  }[];
  createdAt: string;
}

export interface QuotationRequest {
  proposal?: string;
  attachments?: string[];
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType: string;
  budgetRange: string;
  timeline: string;
  requiredFeatures: string[];
  description: string;
  status: 'new' | 'reviewing' | 'quoted' | 'accepted' | 'declined';
  estimatedQuote: number;
  notes?: string;
  createdAt: string;
}

export interface Appointment {
  _id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceType: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  meetingLink?: string;
  notes?: string;
  createdAt: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Testimonial {
  _id: string;
  clientName: string;
  company: string;
  role: string;
  avatarUrl?: string;
  rating: number;
  reviewText: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface BlogPost {
  seoTitle?: string;
  seoDescription?: string;
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
  readTimeMinutes: number;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  orderIndex: number;
  isActive: boolean;
}

export interface ChatMessage {
  _id?: string;
  sender: 'client' | 'admin' | 'assistant';
  senderName?: string;
  message: string;
  sentAt: string;
  isRead: boolean;
}

export interface ChatConversation {
  _id: string;
  sessionId: string;
  clientName: string;
  clientEmail?: string;
  status: 'active' | 'closed';
  messages: ChatMessage[];
  lastMessageAt: string;
}

export interface WebsiteSettings {
  logoUrl: string;
  footerText: string;
  brandColor: string;
  timeZone: string;
  cancellationHours: number;
  pageSeo: Record<string, { title: string; description: string }>;
  _id: string;
  studioName: string;
  tagline: string;
  contactEmail: string;
  whatsappNumber: string;
  businessHours: {
    start: string;
    end: string;
    workDays: number[];
  };
  slotDurationMinutes: number;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    dribbble?: string;
  };
}

export interface DashboardStats {
  kpi: {
    inquiries: { total: number; new: number };
    quotations: { total: number; new: number; pipelineValue: number };
    appointments: { total: number; confirmed: number; today: number };
    content: {
      projects: number;
      services: number;
      testimonials: number;
      pendingReviews: number;
      blogPosts: number;
      activeChats: number;
    };
  };
  recentActivity: {
    inquiries: Inquiry[];
    appointments: Appointment[];
    quotations: QuotationRequest[];
  };
}
