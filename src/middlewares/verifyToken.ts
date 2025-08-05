import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; id?: string };
}

export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // No hay secreto configurado, esto es un error de configuración del servidor
    return res.status(500).json({ error: 'Error de configuración del servidor: JWT_SECRET no definido' });
  }
  try {
    const decoded = jwt.verify(token, secret) as { userId: string };
    req.user = { userId: decoded.userId, id: decoded.userId };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};
