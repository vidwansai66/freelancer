import { Request, Response } from 'express';
import { contentStore } from '../services/contentStore';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = contentStore.getSettings();
    sendSuccess(res, settings, 'Website settings retrieved.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = contentStore.updateSettings(req.body);
    sendSuccess(res, settings, 'Website settings updated successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
