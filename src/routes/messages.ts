// src/routes/messages.ts
import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController';

const router = express.Router();

// 📤 Enviar mensaje
router.post('/', sendMessage);

// 📥 Obtener historial de mensajes
router.get('/', getMessages);

export default router;
