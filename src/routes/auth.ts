import express from 'express';
import { login, getCurrentUser, requestOtp, verifyOtp } from '../controllers/authController';
import { verifyToken, AuthenticatedRequest } from '../middlewares/verifyToken';

const router = express.Router();

// Puedes comentar o eliminar la ruta login tradicional si ya no usarás password
// router.post('/login', login);

// Nueva ruta para solicitar OTP (envía el código por email)
router.post('/request-otp', requestOtp);

// Nueva ruta para verificar OTP y obtener token JWT
router.post('/verify-otp', verifyOtp);

// Ruta para obtener el usuario actual a partir del token
router.get('/me', verifyToken, getCurrentUser);

// Ruta protegida para cambiar la contraseña temporal (puede que ya no se use)
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
