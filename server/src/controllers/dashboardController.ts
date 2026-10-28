import { Request, Response } from 'express';
import { contentStore } from '../services/contentStore';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { env } from '../config/env';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = contentStore.getServices(true);
    const projects = contentStore.getProjects().total;
    const pricingPlans = contentStore.getPricingPlans(true);
    const testimonials = contentStore.getTestimonials(true);
    const faqs = contentStore.getFaqs(true);
    const blogPosts = contentStore.getBlogPosts().total;

    sendSuccess(
      res,
      {
        kpi: {
          inquiries: {
            total: 0,
            new: 0,
          },
          quotations: {
            total: 0,
            new: 0,
            pipelineValue: 0,
          },
          appointments: {
            total: 0,
            confirmed: 0,
            today: 0,
          },
          content: {
            projects,
            services: services.length,
            testimonials: testimonials.length,
            pendingReviews: 0,
            blogPosts,
            activeChats: 0,
            faqs: faqs.length,
            pricingPlans: pricingPlans.length,
          },
          crm: {
            provider: 'Zoho CRM (India DC)',
            isConfigured: Boolean(env.ZOHO_CLIENT_ID?.trim() && env.ZOHO_REFRESH_TOKEN?.trim()),
            portalUrl: 'https://crm.zoho.in',
            authUrl: '/api/zoho/auth',
          },
        },
        recentActivity: {
          inquiries: [],
          appointments: [],
          quotations: [],
        },
      },
      'Dashboard analytics retrieved successfully.',
    );
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
