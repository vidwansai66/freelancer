import rateLimit from 'express-rate-limit';

// Rate limiter for admin login (max 10 requests per 15 minutes)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 100,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
    error: 'RateLimitExceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for public contact, quotation, and appointment forms
export const formSubmissionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 200,
  message: {
    success: false,
    message: 'Too many submissions from this IP address. Please wait a moment before trying again.',
    error: 'RateLimitExceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General public API limiter
export const generalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});
