import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../config/db';
import { login, getCurrentUser } from '../controllers/authController';
import { verifyToken, AuthenticatedRequest } from '../middlewares/verifyToken';

const router = express.Router();

// Ruta para iniciar sesión
router.post('/login', login);

// Ruta para obtener el usuario actual a partir del token
router.get('/me', verifyToken, getCurrentUser);

// Ruta protegida para cambiar la contraseña temporal
router.post('/change-password', verifyToken, async (req: AuthenticatedRequest, res) => {
  const agentId = req.user?.id;
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
