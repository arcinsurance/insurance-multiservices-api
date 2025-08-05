import { Request, Response } from 'express';
import { db } from '../config/db';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/emailService';
import { AuthenticatedRequest } from '../middlewares/verifyToken';
import { RowDataPacket } from 'mysql2';

const OTP_EXPIRATION_MINUTES = 10; // El OTP dura 10 minutos

function generateOtpCode(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

// POST /api/auth/request-otp
export const requestOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email es requerido' });

  try {
    // Verificar que el agente exista y esté activo
    const [users] = await db.execute<RowDataPacket[]>(
      'SELECT id, full_name FROM agents WHERE email = ? AND is_active = 1',
      [email]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado o inactivo' });
    }
    const user = users[0] as { id: string; full_name: string };

    // Generar código OTP
    const otpCode = generateOtpCode();

    // Guardar OTP en base de datos
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60000);
    await db.execute(
      `INSERT INTO otp_codes (id, email, code, expires_at, used)
       VALUES (UUID(), ?, ?, ?, 0)`,
      [email, otpCode, expiresAt]
    );

    // Enviar correo con OTP usando sendEmail
    await sendEmail(
      email,
      'Tu código de autenticación (OTP)',
      `Hola ${user.full_name}, tu código de acceso es: ${otpCode}. Este código expirará en ${OTP_EXPIRATION_MINUTES} minutos.`
    );

    res.json({ message: 'Código de autenticación enviado al correo' });
  } catch (error) {
    console.error('Error en requestOtp:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Admin credentials should not be hard-coded. Use environment variables instead.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE;

// POST /api/auth/verify-otp
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: 'Email y código son requeridos' });

  try {
    // Validar código fijo para admin solo si está configurado en el entorno
    if (ADMIN_EMAIL && ADMIN_SECRET_CODE && email === ADMIN_EMAIL && code === ADMIN_SECRET_CODE) {
      // Obtener info de usuario sin consultar OTP
      const [users] = await db.execute<RowDataPacket[]>(
        'SELECT id, full_name, email, role, is_active FROM agents WHERE email = ? AND is_active = 1',
        [email]
      );
      if (users.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado o inactivo' });
      }
      const user = users[0] as {
        id: string;
        full_name: string;
        email: string;
        role: string;
        is_active: number;
      };

      // Generar token JWT; no usar un valor por defecto inseguro
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET environment variable is not defined');
      }
      const token = jwt.sign(
        { userId: user.id },
        secret,
        { expiresIn: '8h' }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          isActive: !!user.is_active,
        },
      });
    }

    // Validación normal para otros usuarios (OTP en base de datos)
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id FROM otp_codes 
       WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW()`,
      [email, code]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Código inválido o expirado' });
    }
    const otp = rows[0] as { id: string };

    // Marcar OTP como usado
    await db.execute('UPDATE otp_codes SET used = 1 WHERE id = ?', [otp.id]);

    // Obtener info de usuario
    const [users] = await db.execute<RowDataPacket[]>(
      'SELECT id, full_name, email, role, is_active FROM agents WHERE email = ? AND is_active = 1',
      [email]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado o inactivo' });
    }
    const user = users[0] as {
      id: string;
      full_name: string;
      email: string;
      role: string;
      is_active: number;
    };

    // Generar token JWT; no usar valor por defecto inseguro
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }
    const token = jwt.sign(
      { userId: user.id },
      secret,
      { expiresIn: '8h' }
    );

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
    console.error('Error en verifyOtp:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// GET /api/auth/me
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const userId = req.user.id;

    // Consulta para obtener los datos básicos del usuario
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT id, full_name, email, role, is_active FROM agents WHERE id = ? AND is_active = 1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado o inactivo' });
    }

    const user = rows[0] as {
      id: string;
      full_name: string;
      email: string;
      role: string;
      is_active: number;
    };

    res.json({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      isActive: !!user.is_active,
    });
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
