import { Request, Response } from 'express';
import { contentStore } from '../services/contentStore';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getActiveFAQs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const faqs = contentStore.getFaqs();
    sendSuccess(res, faqs, 'FAQs retrieved successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getAllFAQsAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const faqs = contentStore.getFaqs(true);
    sendSuccess(res, faqs, 'All FAQs retrieved successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const createFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, answer, category, orderIndex, isActive } = req.body;

    if (!question || !answer) {
      sendError(res, 'Question and answer are required.', 400);
      return;
    }

    const faq = contentStore.addFaq({
      question: question.trim(),
      answer: answer.trim(),
      category: category ? category.trim() : 'General',
      orderIndex: Number(orderIndex) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    sendSuccess(res, faq, 'FAQ created successfully.', 201);
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updateFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const faq = contentStore.updateFaq(id, req.body);
    if (!faq) {
      sendError(res, 'FAQ not found.', 404);
      return;
    }
    sendSuccess(res, faq, 'FAQ updated successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const deleteFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = contentStore.deleteFaq(id);
    if (!deleted) {
      sendError(res, 'FAQ not found.', 404);
      return;
    }
    sendSuccess(res, { id }, 'FAQ deleted successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
