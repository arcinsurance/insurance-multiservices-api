import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController';

const router = express.Router();

router.post('/', sendMessage); // Para enviar un nuevo mensaje
router.get('/', getMessages);  // Para obtener el historial

export default router;
