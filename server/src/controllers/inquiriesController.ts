import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse';
import {
  syncInquiryToZoho,
  isZohoConfigured,
  hasZohoAuthorization,
} from '../services/zohoService';
import { sendEmail, emailTemplates } from '../services/emailService';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { randomUUID } from 'crypto';

interface LocalInquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  businessType?: string;
  service?: string;
  budget?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'archived';
  replyHistory: Array<{ replyMessage: string; repliedBy: string; repliedAt: Date }>;
  createdAt: string;
  zohoLeadId?: string;
}

const inMemoryInquiries: LocalInquiry[] = [];

export const submitInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, businessType, service, budget, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      sendError(res, 'Name, email, subject, and message are required.', 400);
      return;
    }

    // Save in-memory record for local tracking
    const localId = `inq-${randomUUID().slice(0, 8)}`;
    const inquiryRecord: LocalInquiry = {
      _id: localId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      businessType: businessType || '',
      service: service || '',
      budget: budget || '',
      subject: subject.trim(),
      message: message.trim(),
      status: 'new',
      replyHistory: [],
      createdAt: new Date().toISOString(),
    };

    // 1. If Zoho CRM is configured and authorized, sync lead to Zoho CRM
    if (isZohoConfigured() && hasZohoAuthorization()) {
      const zohoResult = await syncInquiryToZoho(req.body);
      if (!zohoResult.success) {
        // Return 502 with diagnostic details and direct WhatsApp fallback
        sendError(
          res,
          `Zoho CRM sync failed: ${zohoResult.error}. Please contact directly via WhatsApp: +91 94909 55048.`,
          502,
        );
        return;
      }
      inquiryRecord.zohoLeadId = zohoResult.leadId;
    } else {
      console.warn(
        '[Zoho CRM] Notice: Zoho CRM credentials not fully configured or authorization pending. Inquiry saved to local session. Visit /api/zoho/auth to authorize.',
      );
    }

    inMemoryInquiries.unshift(inquiryRecord);

    // 2. Send optional email notifications if SMTP is enabled
    if (env.EMAIL_SERVICE_ENABLED) {
      const confirmation = emailTemplates.inquiryConfirmation(inquiryRecord.name, inquiryRecord.subject);
      sendEmail({
        referenceId: localId,
        to: inquiryRecord.email,
        subject: confirmation.subject,
        html: confirmation.html,
      }).catch((err) => console.error('[Email Error] Inquiry confirmation failed:', err.message));

      const adminAlert = emailTemplates.adminNewNotification(
        'Contact Inquiry',
        `From: ${inquiryRecord.name} (${inquiryRecord.email})\nPhone: ${inquiryRecord.phone || 'N/A'}\nSubject: ${inquiryRecord.subject}\nMessage: ${inquiryRecord.message}`,
      );
      sendEmail({
        referenceId: localId,
        to: env.ADMIN_NOTIFICATION_EMAIL,
        subject: adminAlert.subject,
        html: adminAlert.html,
      }).catch((err) => console.error('[Email Error] Admin notification failed:', err.message));
    }

    sendSuccess(
      res,
      { id: localId, zohoLeadId: inquiryRecord.zohoLeadId },
      'Your inquiry has been submitted successfully. We will get back to you shortly!',
      201,
    );
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getInquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, page = '1', limit = '15' } = req.query;

    let list = [...inMemoryInquiries];
    if (status && status !== 'all') {
      list = list.filter((i) => i.status === status);
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.subject.toLowerCase().includes(q),
      );
    }

    const total = list.length;
    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, parseInt(String(limit), 10));
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = list.slice(startIndex, startIndex + limitNum);

    sendSuccess(res, paginated, 'Inquiries retrieved successfully.', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getInquiryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const inquiry = inMemoryInquiries.find((i) => i._id === id);
    if (!inquiry) {
      sendError(res, 'Inquiry not found.', 404);
      return;
    }
    sendSuccess(res, inquiry, 'Inquiry retrieved successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updateInquiryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const inquiry = inMemoryInquiries.find((i) => i._id === id);
    if (!inquiry) {
      sendError(res, 'Inquiry not found.', 404);
      return;
    }

    inquiry.status = status;
    sendSuccess(res, inquiry, 'Inquiry status updated successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const replyToInquiry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    const inquiry = inMemoryInquiries.find((i) => i._id === id);
    if (!inquiry) {
      sendError(res, 'Inquiry not found.', 404);
      return;
    }

    const repliedBy = req.user?.fullName || 'Studio Admin';
    inquiry.replyHistory.push({
      replyMessage: replyMessage.trim(),
      repliedBy,
      repliedAt: new Date(),
    });
    inquiry.status = 'in_progress';

    sendSuccess(res, inquiry, 'Reply recorded successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const deleteInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const index = inMemoryInquiries.findIndex((i) => i._id === id);
    if (index === -1) {
      sendError(res, 'Inquiry not found.', 404);
      return;
    }
    inMemoryInquiries.splice(index, 1);
    sendSuccess(res, { id }, 'Inquiry deleted successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
