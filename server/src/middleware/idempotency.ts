import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { sendError } from '../utils/apiResponse';

export const checkHoneypotAndDuplicate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // 1. Honeypot check: If the hidden honeypot field is filled, silently ignore spam bot
  if (req.body._hp_company || req.body._hp_website) {
    console.warn(`[Spam Blocked] Honeypot triggered from IP: ${req.ip}`);
    // Respond with success to confuse bot without persisting anything
    res.status(200).json({ success: true, message: 'Submission received successfully' });
    return;
  }

  // Form deduplication is handled by rate limiting and Zoho CRM email lookup.
  next();
};
