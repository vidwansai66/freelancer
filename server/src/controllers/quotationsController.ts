import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse';
import {
  syncQuotationToZoho,
  isZohoConfigured,
  hasZohoAuthorization,
} from '../services/zohoService';
import { sendEmail, emailTemplates } from '../services/emailService';
import { env } from '../config/env';
import { randomUUID } from 'crypto';

interface LocalQuotation {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  businessType?: string;
  projectType: string;
  budgetRange: string;
  timeline: string;
  requiredFeatures: string[];
  description: string;
  status: 'new' | 'reviewed' | 'quoted' | 'declined';
  estimatedQuote?: number;
  notes?: string;
  createdAt: string;
  zohoLeadId?: string;
}

const inMemoryQuotations: LocalQuotation[] = [];

export const submitQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      phone,
      company,
      businessType,
      projectType,
      budgetRange,
      timeline,
      requiredFeatures,
      description,
    } = req.body;

    if (!name || !email || !projectType || !budgetRange || !timeline || !description) {
      sendError(
        res,
        'Name, email, project type, budget range, timeline, and description are required.',
        400,
      );
      return;
    }

    const localId = `quote-${randomUUID().slice(0, 8)}`;
    const quotationRecord: LocalQuotation = {
      _id: localId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      company: company ? company.trim() : '',
      businessType: businessType || '',
      projectType,
      budgetRange,
      timeline,
      requiredFeatures: Array.isArray(requiredFeatures) ? requiredFeatures : [],
      description: description.trim(),
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    // 1. If Zoho CRM is configured and authorized, sync quotation to Zoho CRM
    if (isZohoConfigured() && hasZohoAuthorization()) {
      const zohoResult = await syncQuotationToZoho(req.body);
      if (!zohoResult.success) {
        sendError(
          res,
          `Zoho CRM sync failed: ${zohoResult.error}. Please contact directly via WhatsApp: +91 94909 55048.`,
          502,
        );
        return;
      }
      quotationRecord.zohoLeadId = zohoResult.leadId;
    } else {
      console.warn(
        '[Zoho CRM] Notice: Zoho CRM credentials not fully configured or authorization pending. Quotation saved to local session. Visit /api/zoho/auth to authorize.',
      );
    }

    inMemoryQuotations.unshift(quotationRecord);

    // 2. Send optional email notifications if SMTP is enabled
    if (env.EMAIL_SERVICE_ENABLED) {
      const confirmation = emailTemplates.quotationConfirmation(
        quotationRecord.name,
        quotationRecord.projectType,
        quotationRecord.budgetRange,
      );
      sendEmail({
        referenceId: localId,
        to: quotationRecord.email,
        subject: confirmation.subject,
        html: confirmation.html,
      }).catch((err) => console.error('[Email Error] Quotation confirmation failed:', err.message));

      const adminAlert = emailTemplates.adminNewNotification(
        'Quotation Request',
        `Client: ${quotationRecord.name} (${quotationRecord.email})\nCompany: ${quotationRecord.company || 'N/A'}\nPhone: ${quotationRecord.phone || 'N/A'}\nProject: ${quotationRecord.projectType}\nBudget: ${quotationRecord.budgetRange}\nTimeline: ${quotationRecord.timeline}\nFeatures: ${quotationRecord.requiredFeatures.join(', ')}\nDescription: ${quotationRecord.description}`,
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
      { id: localId, zohoLeadId: quotationRecord.zohoLeadId },
      'Your quotation request has been received. We will prepare your proposal within 24-48 hours!',
      201,
    );
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getQuotations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, page = '1', limit = '15' } = req.query;

    let list = [...inMemoryQuotations];
    if (status && status !== 'all') {
      list = list.filter((q) => q.status === status);
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.company?.toLowerCase().includes(q) ||
          item.projectType.toLowerCase().includes(q),
      );
    }

    const total = list.length;
    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, parseInt(String(limit), 10));
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = list.slice(startIndex, startIndex + limitNum);

    sendSuccess(res, paginated, 'Quotations retrieved successfully.', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getQuotationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const quotation = inMemoryQuotations.find((q) => q._id === id);
    if (!quotation) {
      sendError(res, 'Quotation not found.', 404);
      return;
    }
    sendSuccess(res, quotation, 'Quotation retrieved successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updateQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const quotation = inMemoryQuotations.find((q) => q._id === id);
    if (!quotation) {
      sendError(res, 'Quotation not found.', 404);
      return;
    }

    const { status, estimatedQuote, notes } = req.body;
    if (status) quotation.status = status;
    if (estimatedQuote !== undefined) quotation.estimatedQuote = Number(estimatedQuote);
    if (notes !== undefined) quotation.notes = notes;

    sendSuccess(res, quotation, 'Quotation updated successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const deleteQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const index = inMemoryQuotations.findIndex((q) => q._id === id);
    if (index === -1) {
      sendError(res, 'Quotation not found.', 404);
      return;
    }
    inMemoryQuotations.splice(index, 1);
    sendSuccess(res, { id }, 'Quotation deleted successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
