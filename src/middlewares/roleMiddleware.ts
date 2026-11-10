
import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';

import { AuthenticatedUser } from './authMiddleware';

export const authorizeRoles = (
  ...allowedRoles: AuthenticatedUser['role'][]
): RequestHandler => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource.',
      });
      return;
    }

    next();
  };
};
