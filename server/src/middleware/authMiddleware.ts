import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { sendError } from '../utils/apiResponse';

export interface AdminUserSession {
  _id: string;
  email: string;
  fullName: string;
  role: 'superadmin' | 'admin';
  lastLogin?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AdminUserSession;
}

export const authenticateAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      const cookie = req.headers.cookie
        ?.split(';')
        .map((item) => item.trim())
        .find((item) => item.startsWith('studio_session='));
      if (cookie) token = cookie.slice('studio_session='.length);
    }

    if (!token) {
      sendError(res, 'Authentication required. No token provided.', 401, 'Unauthorized');
      return;
    }

    // Verify token cryptographically
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      role?: string;
    };

    if (!decoded || !decoded.email) {
      sendError(res, 'Invalid or expired authentication token.', 401, 'Unauthorized');
      return;
    }

    req.user = {
      _id: decoded.id || 'superadmin',
      email: decoded.email,
      fullName: env.DEFAULT_ADMIN_NAME,
      role: (decoded.role as any) || 'superadmin',
      lastLogin: new Date().toISOString(),
    };

    next();
  } catch (error: any) {
    sendError(res, 'Invalid or expired authentication token.', 401, 'Unauthorized');
  }
};

export const requireSuperadmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'superadmin') {
    return void sendError(res, 'Only the studio owner can change these settings.', 403);
  }
  next();
};
