import { Request, Response } from 'express';
import { contentStore } from '../services/contentStore';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { slugify } from '../utils/slugify';

export const getPricingPlans = async (_req: Request, res: Response): Promise<void> => {
  try {
    const plans = contentStore.getPricingPlans();
    sendSuccess(res, plans, 'Pricing plans retrieved successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getAllPricingPlansAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const plans = contentStore.getPricingPlans(true);
    sendSuccess(res, plans, 'All pricing plans retrieved successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const createPricingPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      price,
      billingCycle,
      description,
      badge,
      isPopular,
      features,
      ctaText,
      orderIndex,
      isActive,
    } = req.body;

    if (!name || price === undefined || !description) {
      sendError(res, 'Name, price, and description are required.', 400);
      return;
    }

    const slug = slugify(name);
    const plan = contentStore.addPricingPlan({
      name,
      slug,
      price: Number(price),
      billingCycle: billingCycle || 'one-time',
      description,
      badge: badge || '',
      isPopular: Boolean(isPopular),
      features: Array.isArray(features) ? features : [],
      ctaText: ctaText || 'Get Started',
      orderIndex: Number(orderIndex) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    sendSuccess(res, plan, 'Pricing plan created successfully.', 201);
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updatePricingPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.name && !updateData.slug) {
      updateData.slug = slugify(updateData.name);
    }

    const plan = contentStore.updatePricingPlan(id, updateData);
    if (!plan) {
      sendError(res, 'Pricing plan not found.', 404);
      return;
    }

    sendSuccess(res, plan, 'Pricing plan updated successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const deletePricingPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = contentStore.deletePricingPlan(id);
    if (!deleted) {
      sendError(res, 'Pricing plan not found.', 404);
      return;
    }

    sendSuccess(res, { id }, 'Pricing plan deleted successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
