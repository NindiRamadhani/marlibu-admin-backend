import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  console.error('API Error:', err.message);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};