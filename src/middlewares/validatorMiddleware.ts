
import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';

type ValidationTarget = 'body' | 'params' | 'query';

type Validator = (data: unknown) => string | null;

export const validateRequest = (
  target: ValidationTarget,
  validator: Validator
): RequestHandler => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const errorMessage = validator(req[target]);

    if (errorMessage) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errorMessage,
      });
      return;
    }

    next();
  };
};
