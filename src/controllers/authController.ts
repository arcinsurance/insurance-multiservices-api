import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../db'; // Asegúrate de que este sea tu pool de conexión MySQL
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.execute(
      'SELECT id, full_name, email, password_hash, role FROM agents WHERE email = ? AND is_active = 1',
      [email]
    );

    const users = Array.isArray(rows) ? rows : [];
    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = users[0] as any;

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '8h',
    });

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        isActive: true,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
