import { AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: result.error.flatten(),
      });
    }
    // Reemplaza body normalizado (aplica defaults)
    req.body = result.data;
    next();
  };
