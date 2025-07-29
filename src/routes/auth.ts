import express from 'express';
import { requestOtp, verifyOtp, getCurrentUser } from '../controllers/authController';
import { verifyToken, AuthenticatedRequest } from '../middlewares/verifyToken';
import bcrypt from 'bcrypt';
import { db } from '../config/db';

const router = express.Router();

// Si ya no usas login tradicional, elimina esta línea o coméntala
// import { login } from '../controllers/authController';

// Si no tienes login, comenta o elimina esta ruta
// router.post('/login', login);

// Ruta para solicitar OTP (envía el código por email)
router.post('/request-otp', requestOtp);

// Ruta para verificar OTP y obtener token JWT
router.post('/verify-otp', verifyOtp);

// Ruta para obtener el usuario actual a partir del token
router.get('/me', verifyToken, getCurrentUser);

// Ruta protegida para cambiar la contraseña temporal
router.post('/change-password', verifyToken, async (req: AuthenticatedRequest, res) => {
  const agentId = req.user?.userId || req.user?.id;  // Ajusta según tu token payload

  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña es muy corta.' });
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);

    await db.execute(
      `UPDATE agents
       SET password = ?, must_change_password = 0
       WHERE id = ?`,
      [hashed, agentId]
    );

    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Error al cambiar la contraseña:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
