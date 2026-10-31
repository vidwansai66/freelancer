import {
  servicesData,
  projectsData,
  pricingPlansData,
  faqsData,
  testimonialsData,
  blogPostsData,
  studioSettingsData,
  ServiceItem,
  ProjectItem,
  PricingPlanItem,
  FAQItem,
  TestimonialItem,
  BlogPostItem,
  StudioSettings,
} from '../data/content';
import { randomUUID } from 'crypto';
import { loadJsonFromBestPath, saveJsonToAllPaths } from '../utils/storagePaths';

class ContentStore {
  private services: ServiceItem[] = [...servicesData];
  private projects: ProjectItem[] = [...projectsData];
  private pricingPlans: PricingPlanItem[] = [...pricingPlansData];
  private faqs: FAQItem[] = [...faqsData];
  private testimonials: TestimonialItem[] = [...testimonialsData];
  private blogPosts: BlogPostItem[] = [...blogPostsData];
  private settings: StudioSettings = { ...studioSettingsData };

  constructor() {
    this.loadFromDisk();
    this.saveToDisk();
  }

  private loadFromDisk(): void {
    const parsed = loadJsonFromBestPath<any>('wp_content_store.json', null);
    if (parsed) {
      if (Array.isArray(parsed.services)) this.services = parsed.services;
      if (Array.isArray(parsed.projects)) this.projects = parsed.projects;
      if (Array.isArray(parsed.pricingPlans)) this.pricingPlans = parsed.pricingPlans;
      if (Array.isArray(parsed.faqs)) this.faqs = parsed.faqs;
      if (Array.isArray(parsed.testimonials)) this.testimonials = parsed.testimonials;
      if (Array.isArray(parsed.blogPosts)) this.blogPosts = parsed.blogPosts;
      if (parsed.settings) this.settings = { ...this.settings, ...parsed.settings };
    }
  }

  private saveToDisk(): void {
    saveJsonToAllPaths('wp_content_store.json', {
      services: this.services,
      projects: this.projects,
      pricingPlans: this.pricingPlans,
      faqs: this.faqs,
      testimonials: this.testimonials,
      blogPosts: this.blogPosts,
      settings: this.settings,
    });
  }

  // Services
  getServices(all = false): ServiceItem[] {
    this.loadFromDisk();
    const list = all ? this.services : this.services.filter((s) => s.isPublished !== false);
    return [...list].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }

  getServiceBySlug(slug: string): ServiceItem | undefined {
    this.loadFromDisk();
    return this.services.find((s) => s.slug === slug);
  }

  getServiceById(id: string): ServiceItem | undefined {
    this.loadFromDisk();
    return this.services.find((s) => s._id === id);
  }

  addService(data: Partial<ServiceItem>): ServiceItem {
    this.loadFromDisk();
    const newService: ServiceItem = {
      _id: data._id || `srv-${randomUUID().slice(0, 8)}`,
      isPublished: data.isPublished ?? true,
      title: data.title || 'New Service',
      slug: data.slug || `service-${Date.now()}`,
      shortDescription: data.shortDescription || '',
      fullDescription: data.fullDescription || '',
      icon: data.icon || 'Globe',
      deliverables: Array.isArray(data.deliverables) ? data.deliverables : [],
      startingPrice: Number(data.startingPrice) || 0,
      isFeatured: Boolean(data.isFeatured),
      orderIndex: Number(data.orderIndex) || this.services.length + 1,
      createdAt: new Date().toISOString(),
    };
    this.services.push(newService);
    this.saveToDisk();
    return newService;
  }

  updateService(id: string, data: Partial<ServiceItem>): ServiceItem | undefined {
    this.loadFromDisk();
    const index = this.services.findIndex((s) => s._id === id);
    if (index === -1) return undefined;
    this.services[index] = { ...this.services[index], ...data };
    this.saveToDisk();
    return this.services[index];
  }

  deleteService(id: string): boolean {
    this.loadFromDisk();
    const prevLen = this.services.length;
    this.services = this.services.filter((s) => s._id !== id);
    this.saveToDisk();
    return this.services.length < prevLen;
  }

  // Projects
  getProjects(params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    featured?: string | boolean;
    status?: string;
  }) {
    this.loadFromDisk();
    let list = [...this.projects];

    // Status filter: by default (for public), exclude drafts unless status is 'all' or 'draft'
    if (params?.status === 'draft') {
      list = list.filter((p) => p.status === 'draft');
    } else if (params?.status === 'all') {
      // return all projects including drafts
    } else {
      // default: only published projects
      list = list.filter((p) => p.status !== 'draft');
    }

    if (params?.featured !== undefined) {
      const want = String(params.featured) === 'true';
      list = list.filter((p) => Boolean(p.isFeatured) === want);
    }
    if (params?.category && params.category !== 'All') {
      const catLower = params.category.toLowerCase().trim();
      list = list.filter((p) => (p.category || '').toLowerCase().trim() === catLower);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.clientName || '').toLowerCase().includes(q) ||
          (p.industry || '').toLowerCase().includes(q) ||
          (p.summary || '').toLowerCase().includes(q) ||
          (Array.isArray(p.technologies) && p.technologies.some((t) => t.toLowerCase().includes(q))),
      );
    }
    list.sort((a, b) => {
      // 1. Featured projects first
      const featA = a.isFeatured ? 1 : 0;
      const featB = b.isFeatured ? 1 : 0;
      if (featA !== featB) {
        return featB - featA;
      }
      // 2. Lowest orderIndex first if explicitly set and distinct
      const ordA = a.orderIndex !== undefined && a.orderIndex !== null ? a.orderIndex : 999;
      const ordB = b.orderIndex !== undefined && b.orderIndex !== null ? b.orderIndex : 999;
      if (ordA !== ordB) {
        return ordA - ordB;
      }
      // 3. Newest createdAt first
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    const total = list.length;
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 20;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  getProjectBySlug(slug: string, allowDraft = false): ProjectItem | undefined {
    this.loadFromDisk();
    const p = this.projects.find((item) => item.slug === slug || item._id === slug);
    if (!p) return undefined;
    if (p.status === 'draft' && !allowDraft) {
      return undefined;
    }
    return p;
  }

  getProjectById(id: string): ProjectItem | undefined {
    this.loadFromDisk();
    return this.projects.find((p) => p._id === id || p.slug === id);
  }

  addProject(data: Partial<ProjectItem>): ProjectItem {
    this.loadFromDisk();
    const newProject: ProjectItem = {
      _id: data._id || `prj-${randomUUID().slice(0, 8)}`,
      title: data.title || 'New Project',
      slug: data.slug || `project-${Date.now()}`,
      category: data.category || 'Web Application',
      clientName: data.clientName || '',
      industry: data.industry || '',
      resultStat: data.resultStat || '',
      summary: data.summary || '',
      description: data.description || '',
      objectives: data.objectives || '',
      challenges: data.challenges || '',
      solutions: data.solutions || '',
      results: data.results || '',
      featuredImage: data.featuredImage || '',
      galleryImages: Array.isArray(data.galleryImages) ? data.galleryImages : [],
      liveUrl: data.liveUrl || '',
      githubUrl: data.githubUrl || '',
      technologies: Array.isArray(data.technologies) ? data.technologies : [],
      servicesDelivered: Array.isArray(data.servicesDelivered) ? data.servicesDelivered : [],
      caseStudyMarkdown: data.caseStudyMarkdown || '',
      seoTitle: data.seoTitle || '',
      seoDescription: data.seoDescription || '',
      status: data.status === 'draft' ? 'draft' : 'published',
      isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : true,
      orderIndex: data.orderIndex !== undefined && Number(data.orderIndex) >= 0 ? Number(data.orderIndex) : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Prepend new project so it immediately shows at the top
    this.projects.unshift(newProject);
    this.saveToDisk();
    return newProject;
  }

  updateProject(id: string, data: Partial<ProjectItem>): ProjectItem | undefined {
    this.loadFromDisk();
    const index = this.projects.findIndex((p) => p._id === id || p.slug === id);
    if (index === -1) return undefined;
    this.projects[index] = {
      ...this.projects[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
    return this.projects[index];
  }

  reorderProjects(orders: Array<{ id: string; orderIndex: number }>): boolean {
    this.loadFromDisk();
    const orderMap = new Map<string, number>();
    for (const item of orders) {
      orderMap.set(item.id, item.orderIndex);
    }
    for (const p of this.projects) {
      if (orderMap.has(p._id)) {
        p.orderIndex = orderMap.get(p._id)!;
      }
    }
    this.saveToDisk();
    return true;
  }

  deleteProject(id: string): boolean {
    this.loadFromDisk();
    const prevLen = this.projects.length;
    this.projects = this.projects.filter((p) => p._id !== id && p.slug !== id);
    this.saveToDisk();
    return this.projects.length < prevLen;
  }

  // Pricing Plans
  getPricingPlans(all = false): PricingPlanItem[] {
    this.loadFromDisk();
    const list = all ? this.pricingPlans : this.pricingPlans.filter((p) => p.isActive !== false);
    return [...list].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }

  getPricingPlanById(id: string): PricingPlanItem | undefined {
    this.loadFromDisk();
    return this.pricingPlans.find((p) => p._id === id);
  }

  addPricingPlan(data: Partial<PricingPlanItem>): PricingPlanItem {
    this.loadFromDisk();
    const newPlan: PricingPlanItem = {
      _id: data._id || `prc-${randomUUID().slice(0, 8)}`,
      name: data.name || 'New Plan',
      slug: data.slug || `plan-${Date.now()}`,
      price: Number(data.price) || 0,
      billingCycle: data.billingCycle || 'one-time',
      description: data.description || '',
      badge: data.badge || '',
      isPopular: Boolean(data.isPopular),
      features: Array.isArray(data.features) ? data.features : [],
      ctaText: data.ctaText || 'Get Started',
      orderIndex: Number(data.orderIndex) || this.pricingPlans.length + 1,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    this.pricingPlans.push(newPlan);
    this.saveToDisk();
    return newPlan;
  }

  updatePricingPlan(id: string, data: Partial<PricingPlanItem>): PricingPlanItem | undefined {
    this.loadFromDisk();
    const index = this.pricingPlans.findIndex((p) => p._id === id);
    if (index === -1) return undefined;
    this.pricingPlans[index] = { ...this.pricingPlans[index], ...data };
    this.saveToDisk();
    return this.pricingPlans[index];
  }

  deletePricingPlan(id: string): boolean {
    this.loadFromDisk();
    const prevLen = this.pricingPlans.length;
    this.pricingPlans = this.pricingPlans.filter((p) => p._id !== id);
    this.saveToDisk();
    return this.pricingPlans.length < prevLen;
  }

  // FAQs
  getFaqs(all = false): FAQItem[] {
    this.loadFromDisk();
    const list = all ? this.faqs : this.faqs.filter((f) => f.isActive !== false);
    return [...list].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }

  getFaqById(id: string): FAQItem | undefined {
    this.loadFromDisk();
    return this.faqs.find((f) => f._id === id);
  }

  addFaq(data: Partial<FAQItem>): FAQItem {
    this.loadFromDisk();
    const newFaq: FAQItem = {
      _id: data._id || `faq-${randomUUID().slice(0, 8)}`,
      question: data.question || '',
      answer: data.answer || '',
      category: data.category || 'General',
      orderIndex: Number(data.orderIndex) || this.faqs.length + 1,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    this.faqs.push(newFaq);
    this.saveToDisk();
    return newFaq;
  }

  updateFaq(id: string, data: Partial<FAQItem>): FAQItem | undefined {
    this.loadFromDisk();
    const index = this.faqs.findIndex((f) => f._id === id);
    if (index === -1) return undefined;
    this.faqs[index] = { ...this.faqs[index], ...data };
    this.saveToDisk();
    return this.faqs[index];
  }

  deleteFaq(id: string): boolean {
    this.loadFromDisk();
    const prevLen = this.faqs.length;
    this.faqs = this.faqs.filter((f) => f._id !== id);
    this.saveToDisk();
    return this.faqs.length < prevLen;
  }

  // Testimonials
  getTestimonials(all = false): TestimonialItem[] {
    this.loadFromDisk();
    const list = all ? this.testimonials : this.testimonials.filter((t) => t.isApproved);
    return [...list];
  }

  getTestimonialById(id: string): TestimonialItem | undefined {
    this.loadFromDisk();
    return this.testimonials.find((t) => t._id === id);
  }

  addTestimonial(data: Partial<TestimonialItem>): TestimonialItem {
    this.loadFromDisk();
    const newTestimonial: TestimonialItem = {
      _id: data._id || `tst-${randomUUID().slice(0, 8)}`,
      clientName: data.clientName || 'Anonymous',
      company: data.company || '',
      role: data.role || '',
      avatarUrl: data.avatarUrl || '',
      rating: Number(data.rating) || 5,
      reviewText: data.reviewText || '',
      isApproved: data.isApproved ?? false,
      isFeatured: Boolean(data.isFeatured),
      createdAt: new Date().toISOString(),
    };
    this.testimonials.push(newTestimonial);
    this.saveToDisk();
    return newTestimonial;
  }

  updateTestimonial(id: string, data: Partial<TestimonialItem>): TestimonialItem | undefined {
    this.loadFromDisk();
    const index = this.testimonials.findIndex((t) => t._id === id);
    if (index === -1) return undefined;
    this.testimonials[index] = { ...this.testimonials[index], ...data };
    this.saveToDisk();
    return this.testimonials[index];
  }

  deleteTestimonial(id: string): boolean {
    this.loadFromDisk();
    const prevLen = this.testimonials.length;
    this.testimonials = this.testimonials.filter((t) => t._id !== id);
    this.saveToDisk();
    return this.testimonials.length < prevLen;
  }

  // Blog Posts
  getBlogPosts(params?: { tag?: string; search?: string; page?: number; limit?: number }) {
    this.loadFromDisk();
    let list = [...this.blogPosts].filter((b) => b.isPublished);
    if (params?.tag) {
      list = list.filter((b) => b.tags.map((t) => t.toLowerCase()).includes(params.tag!.toLowerCase()));
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.summary.toLowerCase().includes(q) ||
          b.content.toLowerCase().includes(q),
      );
    }
    const total = list.length;
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 10;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  getBlogPostBySlug(slug: string): BlogPostItem | undefined {
    this.loadFromDisk();
    return this.blogPosts.find((b) => b.slug === slug);
  }

  getBlogPostById(id: string): BlogPostItem | undefined {
    this.loadFromDisk();
    return this.blogPosts.find((b) => b._id === id);
  }

  addBlogPost(data: Partial<BlogPostItem>): BlogPostItem {
    this.loadFromDisk();
    const newPost: BlogPostItem = {
      _id: data._id || `blg-${randomUUID().slice(0, 8)}`,
      title: data.title || 'New Blog Post',
      slug: data.slug || `post-${Date.now()}`,
      summary: data.summary || '',
      content: data.content || '',
      coverImage: data.coverImage || '',
      author: data.author || 'Studio Admin',
      tags: Array.isArray(data.tags) ? data.tags : [],
      readTimeMinutes: Number(data.readTimeMinutes) || 4,
      isPublished: data.isPublished ?? true,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.blogPosts.push(newPost);
    this.saveToDisk();
    return newPost;
  }

  updateBlogPost(id: string, data: Partial<BlogPostItem>): BlogPostItem | undefined {
    this.loadFromDisk();
    const index = this.blogPosts.findIndex((b) => b._id === id);
    if (index === -1) return undefined;
    this.blogPosts[index] = { ...this.blogPosts[index], ...data };
    this.saveToDisk();
    return this.blogPosts[index];
  }

  deleteBlogPost(id: string): boolean {
    this.loadFromDisk();
    const prevLen = this.blogPosts.length;
    this.blogPosts = this.blogPosts.filter((b) => b._id !== id);
    this.saveToDisk();
    return this.blogPosts.length < prevLen;
  }

  // Settings
  getSettings(): StudioSettings {
    this.loadFromDisk();
    return { ...this.settings };
  }

  updateSettings(data: Partial<StudioSettings>): StudioSettings {
    this.loadFromDisk();
    this.settings = { ...this.settings, ...data };
    this.saveToDisk();
    return { ...this.settings };
  }
}

export const contentStore = new ContentStore();
