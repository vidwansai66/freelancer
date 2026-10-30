import { Request, Response } from 'express';
import { contentStore } from '../services/contentStore';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getApprovedTestimonials = async (_req: Request, res: Response): Promise<void> => {
  try {
    const testimonials = contentStore.getTestimonials();
    sendSuccess(res, testimonials, 'Approved testimonials retrieved successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const submitReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientName, company, role, rating, reviewText, avatarUrl } = req.body;

    if (!clientName || !company || !reviewText) {
      sendError(res, 'Client name, company, and review text are required.', 400);
      return;
    }

    const review = contentStore.addTestimonial({
      clientName: clientName.trim(),
      company: company.trim(),
      role: role ? role.trim() : 'Client',
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      reviewText: reviewText.trim(),
      avatarUrl: avatarUrl || '',
      isApproved: true,
      isFeatured: false,
    });

    sendSuccess(
      res,
      review,
      'Thank you for your feedback! Your review has been submitted successfully.',
      201,
    );
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getAllTestimonialsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    let testimonials = contentStore.getTestimonials(true);

    if (search) {
      const q = String(search).toLowerCase();
      testimonials = testimonials.filter(
        (t) =>
          t.clientName.toLowerCase().includes(q) ||
          t.company.toLowerCase().includes(q) ||
          t.reviewText.toLowerCase().includes(q),
      );
    }

    const total = testimonials.length;
    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, parseInt(String(limit), 10));
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = testimonials.slice(startIndex, startIndex + limitNum);

    sendSuccess(res, paginated, 'All testimonials retrieved successfully.', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const toggleApproveTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isApproved, isFeatured } = req.body;

    const updateData: any = {};
    if (isApproved !== undefined) updateData.isApproved = Boolean(isApproved);
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);

    const testimonial = contentStore.updateTestimonial(id, updateData);
    if (!testimonial) {
      sendError(res, 'Testimonial not found.', 404);
      return;
    }

    sendSuccess(res, testimonial, 'Testimonial updated successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const deleteTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = contentStore.deleteTestimonial(id);
    if (!deleted) {
      sendError(res, 'Testimonial not found.', 404);
      return;
    }

    sendSuccess(res, { id }, 'Testimonial deleted successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
