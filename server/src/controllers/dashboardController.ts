import { Request, Response } from 'express';
import { contentStore } from '../services/contentStore';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { env } from '../config/env';
import { getAllAppointments } from './appointmentsController';
import { getAllInquiries } from './inquiriesController';
import { getAllQuotations } from './quotationsController';
import { getAllChatSessions } from './chatController';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = contentStore.getServices(true);
    const projects = contentStore.getProjects().total;
    const pricingPlans = contentStore.getPricingPlans(true);
    const testimonials = contentStore.getTestimonials(true);
    const faqs = contentStore.getFaqs(true);
    const blogPosts = contentStore.getBlogPosts().total;

    const allAppointments = getAllAppointments();
    const inquiries = getAllInquiries();
    const quotations = getAllQuotations();
    const chatSessions = getAllChatSessions();

    const todayStr = new Date().toISOString().slice(0, 10);
    const confirmedCount = allAppointments.filter((a) => a.status === 'confirmed').length;
    const todayCount = allAppointments.filter(
      (a) => a.appointmentDate === todayStr && a.status === 'confirmed',
    ).length;

    const pipelineValue = quotations.reduce((sum, q) => sum + (q.estimatedQuote || 0), 0);
    const pendingReviewsCount = testimonials.filter((t) => !t.isApproved).length;
    const activeChatsCount = chatSessions.filter((c) => c.status === 'active').length;

    sendSuccess(
      res,
      {
        kpi: {
          inquiries: {
            total: inquiries.length,
            new: inquiries.filter((i) => i.status === 'new').length,
          },
          quotations: {
            total: quotations.length,
            new: quotations.filter((q) => q.status === 'new').length,
            pipelineValue,
          },
          appointments: {
            total: allAppointments.length,
            confirmed: confirmedCount,
            today: todayCount,
          },
          content: {
            projects,
            services: services.length,
            testimonials: testimonials.length,
            pendingReviews: pendingReviewsCount,
            blogPosts,
            activeChats: activeChatsCount,
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
          inquiries: inquiries.slice(0, 5),
          appointments: allAppointments.slice(0, 5),
          quotations: quotations.slice(0, 5),
        },
      },
      'Dashboard analytics retrieved successfully.',
    );
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
