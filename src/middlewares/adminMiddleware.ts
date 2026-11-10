
import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Silakan login terlebih dahulu',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Akses hanya untuk admin',
    });
    return;
  }

  next();
};
