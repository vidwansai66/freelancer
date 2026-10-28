import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export const errorHandler = (err: any, _req: Request, res: Response, next: NextFunction): void => {
  console.error('[Unhandled Error]', err);
  if (res.headersSent) {
    next(err);
    return;
  }

  // Duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    sendError(res, `Duplicate submission or entry detected for ${field}.`, 409, 'Conflict');
    return;
  }

  // Schema validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    sendError(res, messages.join(', '), 400, 'Validation Error');
    return;
  }

  // CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    sendError(res, `Invalid ID format for ${err.path}.`, 400, 'Invalid Parameter');
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  sendError(res, message, statusCode);
};
