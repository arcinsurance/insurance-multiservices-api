import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { AuthenticatedRequest } from '../middlewares/verifyToken';

/* -------------------------------------------------- */
/* POST /api/auth/login                               */
/* -------------------------------------------------- */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 1. Buscar usuario activo por email
    const [rows] = await db.execute(
      'SELECT id, full_name, email, password, role, is_active FROM agents WHERE email = ? AND is_active = 1',
      [email]
    );

    const users = Array.isArray(rows) ? rows : [];
    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user: any = users[0];

    // 2. Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Firmar token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '8h' }
    );

    // 4. Respuesta
    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        isActive: !!user.is_active,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/* -------------------------------------------------- */
/* GET /api/auth/me (con middleware)                  */
/* -------------------------------------------------- */
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const [rows] = await db.execute(
      'SELECT id, full_name, email, role, is_active FROM agents WHERE id = ?',
      [userId]
    );

    const users = Array.isArray(rows) ? rows : [];
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user: any = users[0];

    res.json({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      isActive: !!user.is_active,
    });
  } catch (error) {
    console.error('Error en /auth/me:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
