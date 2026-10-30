import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Please provide both email and password.', 400, 'Bad Request');
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const expectedEmail = env.DEFAULT_ADMIN_EMAIL.toLowerCase().trim();

    if (cleanEmail !== expectedEmail || password !== env.DEFAULT_ADMIN_PASSWORD) {
      sendError(res, 'Invalid email or password credentials.', 401, 'Unauthorized');
      return;
    }

    const adminUser = {
      id: 'superadmin',
      email: env.DEFAULT_ADMIN_EMAIL,
      fullName: env.DEFAULT_ADMIN_NAME,
      role: 'superadmin',
      lastLogin: new Date().toISOString(),
    };

    // Generate JWT token signed with secure server secret
    const token = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any },
    );

    res.cookie('studio_session', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 86400000,
      path: '/',
    });

    sendSuccess(
      res,
      {
        token,
        admin: adminUser,
      },
      'Admin logged in successfully.',
    );
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getCurrentAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    sendSuccess(
      res,
      {
        id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        role: req.user.role,
        lastLogin: req.user.lastLogin,
      },
      'Current admin retrieved.',
    );
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updateAdminProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const { fullName, email } = req.body;
    sendSuccess(
      res,
      {
        id: req.user._id,
        email: email || req.user.email,
        fullName: fullName || req.user.fullName,
        role: req.user.role,
      },
      'Admin profile updated successfully.',
    );
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
