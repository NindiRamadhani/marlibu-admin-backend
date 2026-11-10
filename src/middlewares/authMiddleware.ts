
import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: 'admin' | 'staff' | 'user';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication token is required.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
    return;
  }

  if (!jwtSecret) {
    res.status(500).json({
      success: false,
      message: 'JWT secret is not configured.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (
      typeof decoded === 'string' ||
      typeof decoded.id !== 'number' ||
      typeof decoded.email !== 'string' ||
      !['admin', 'staff', 'user'].includes(decoded.role as string)
    ) {
      res.status(401).json({
        success: false,
        message: 'Invalid token payload.',
      });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role as AuthenticatedUser['role'],
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};
