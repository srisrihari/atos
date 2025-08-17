import { Request, Response, NextFunction } from 'express';
import { Clerk } from '@clerk/clerk-sdk-node';
import { AppError } from './errorHandler.js';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
      };
    }
  }
}

// Initialize Clerk
const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionToken = req.headers.authorization?.split(' ')[1];

    if (!sessionToken) {
      throw new AppError('No authentication token provided', 401);
    }

    const session = await clerk.sessions.verifySession(sessionToken);

    if (!session) {
      throw new AppError('Invalid authentication token', 401);
    }

    // Add user info to request
    req.auth = {
      userId: session.userId,
      sessionId: session.id
    };

    next();
  } catch (error) {
    next(new AppError('Authentication failed', 401));
  }
};
