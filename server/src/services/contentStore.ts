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

class ContentStore {
  private services: ServiceItem[] = [...servicesData];
  private projects: ProjectItem[] = [...projectsData];
  private pricingPlans: PricingPlanItem[] = [...pricingPlansData];
  private faqs: FAQItem[] = [...faqsData];
  private testimonials: TestimonialItem[] = [...testimonialsData];
  private blogPosts: BlogPostItem[] = [...blogPostsData];
  private settings: StudioSettings = { ...studioSettingsData };

  // Services
  getServices(all = false): ServiceItem[] {
    const list = all ? this.services : this.services.filter((s) => s.isPublished !== false);
    return [...list].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }

  getServiceBySlug(slug: string): ServiceItem | undefined {
    return this.services.find((s) => s.slug === slug);
  }

  getServiceById(id: string): ServiceItem | undefined {
    return this.services.find((s) => s._id === id);
  }

  addService(data: Partial<ServiceItem>): ServiceItem {
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
    return newService;
  }

  updateService(id: string, data: Partial<ServiceItem>): ServiceItem | undefined {
    const index = this.services.findIndex((s) => s._id === id);
    if (index === -1) return undefined;
    this.services[index] = { ...this.services[index], ...data };
    return this.services[index];
  }

  deleteService(id: string): boolean {
    const prevLen = this.services.length;
    this.services = this.services.filter((s) => s._id !== id);
    return this.services.length < prevLen;
  }

  // Projects
  getProjects(params?: { category?: string; search?: string; page?: number; limit?: number }) {
    let list = [...this.projects];
    if (params?.category) {
      list = list.filter((p) => p.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.clientName.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
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

  getProjectBySlug(slug: string): ProjectItem | undefined {
    return this.projects.find((p) => p.slug === slug);
  }

  getProjectById(id: string): ProjectItem | undefined {
    return this.projects.find((p) => p._id === id);
  }

  addProject(data: Partial<ProjectItem>): ProjectItem {
    const newProject: ProjectItem = {
      _id: data._id || `prj-${randomUUID().slice(0, 8)}`,
      title: data.title || 'New Project',
      slug: data.slug || `project-${Date.now()}`,
      category: data.category || 'Web Design',
      clientName: data.clientName || '',
      resultStat: data.resultStat || '',
      featuredImage: data.featuredImage || '',
      galleryImages: Array.isArray(data.galleryImages) ? data.galleryImages : [],
      liveUrl: data.liveUrl || '',
      githubUrl: data.githubUrl || '',
      technologies: Array.isArray(data.technologies) ? data.technologies : [],
      caseStudyMarkdown: data.caseStudyMarkdown || '',
      isFeatured: Boolean(data.isFeatured),
      orderIndex: Number(data.orderIndex) || this.projects.length + 1,
      createdAt: new Date().toISOString(),
    };
    this.projects.push(newProject);
    return newProject;
  }

  updateProject(id: string, data: Partial<ProjectItem>): ProjectItem | undefined {
    const index = this.projects.findIndex((p) => p._id === id);
    if (index === -1) return undefined;
    this.projects[index] = { ...this.projects[index], ...data };
    return this.projects[index];
  }

  deleteProject(id: string): boolean {
    const prevLen = this.projects.length;
    this.projects = this.projects.filter((p) => p._id !== id);
    return this.projects.length < prevLen;
  }

  // Pricing Plans
  getPricingPlans(all = false): PricingPlanItem[] {
    const list = all ? this.pricingPlans : this.pricingPlans.filter((p) => p.isActive !== false);
    return [...list].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }

  getPricingPlanById(id: string): PricingPlanItem | undefined {
    return this.pricingPlans.find((p) => p._id === id);
  }

  addPricingPlan(data: Partial<PricingPlanItem>): PricingPlanItem {
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
    return newPlan;
  }

  updatePricingPlan(id: string, data: Partial<PricingPlanItem>): PricingPlanItem | undefined {
    const index = this.pricingPlans.findIndex((p) => p._id === id);
    if (index === -1) return undefined;
    this.pricingPlans[index] = { ...this.pricingPlans[index], ...data };
    return this.pricingPlans[index];
  }

  deletePricingPlan(id: string): boolean {
    const prevLen = this.pricingPlans.length;
    this.pricingPlans = this.pricingPlans.filter((p) => p._id !== id);
    return this.pricingPlans.length < prevLen;
  }

  // FAQs
  getFaqs(all = false): FAQItem[] {
    const list = all ? this.faqs : this.faqs.filter((f) => f.isActive !== false);
    return [...list].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }

  getFaqById(id: string): FAQItem | undefined {
    return this.faqs.find((f) => f._id === id);
  }

  addFaq(data: Partial<FAQItem>): FAQItem {
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
    return newFaq;
  }

  updateFaq(id: string, data: Partial<FAQItem>): FAQItem | undefined {
    const index = this.faqs.findIndex((f) => f._id === id);
    if (index === -1) return undefined;
    this.faqs[index] = { ...this.faqs[index], ...data };
    return this.faqs[index];
  }

  deleteFaq(id: string): boolean {
    const prevLen = this.faqs.length;
    this.faqs = this.faqs.filter((f) => f._id !== id);
    return this.faqs.length < prevLen;
  }

  // Testimonials
  getTestimonials(all = false): TestimonialItem[] {
    const list = all ? this.testimonials : this.testimonials.filter((t) => t.isApproved);
    return [...list];
  }

  getTestimonialById(id: string): TestimonialItem | undefined {
    return this.testimonials.find((t) => t._id === id);
  }

  addTestimonial(data: Partial<TestimonialItem>): TestimonialItem {
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
    return newTestimonial;
  }

  updateTestimonial(id: string, data: Partial<TestimonialItem>): TestimonialItem | undefined {
    const index = this.testimonials.findIndex((t) => t._id === id);
    if (index === -1) return undefined;
    this.testimonials[index] = { ...this.testimonials[index], ...data };
    return this.testimonials[index];
  }

  deleteTestimonial(id: string): boolean {
    const prevLen = this.testimonials.length;
    this.testimonials = this.testimonials.filter((t) => t._id !== id);
    return this.testimonials.length < prevLen;
  }

  // Blog Posts
  getBlogPosts(params?: { tag?: string; search?: string; page?: number; limit?: number }) {
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
    return this.blogPosts.find((b) => b.slug === slug);
  }

  getBlogPostById(id: string): BlogPostItem | undefined {
    return this.blogPosts.find((b) => b._id === id);
  }

  addBlogPost(data: Partial<BlogPostItem>): BlogPostItem {
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
    return newPost;
  }

  updateBlogPost(id: string, data: Partial<BlogPostItem>): BlogPostItem | undefined {
    const index = this.blogPosts.findIndex((b) => b._id === id);
    if (index === -1) return undefined;
    this.blogPosts[index] = { ...this.blogPosts[index], ...data };
    return this.blogPosts[index];
  }

  deleteBlogPost(id: string): boolean {
    const prevLen = this.blogPosts.length;
    this.blogPosts = this.blogPosts.filter((b) => b._id !== id);
    return this.blogPosts.length < prevLen;
  }

  // Settings
  getSettings(): StudioSettings {
    return { ...this.settings };
  }

  updateSettings(data: Partial<StudioSettings>): StudioSettings {
    this.settings = { ...this.settings, ...data };
    return { ...this.settings };
  }
}

export const contentStore = new ContentStore();
