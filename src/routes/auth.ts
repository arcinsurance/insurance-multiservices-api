import express from 'express';
import { login, getCurrentUser } from '../controllers/authController';

const router = express.Router();

// Ruta para iniciar sesión
router.post('/login', login);

// Ruta para obtener el usuario actual a partir del token
router.get('/me', getCurrentUser);

export default router;
