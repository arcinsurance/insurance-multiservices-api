import express, { Request, Response } from 'express';
import multer from 'multer';
import { sendEmailWithAttachment } from '../utils/emailService';  // Importa la función de envío

import { sendMessage, getMessages } from '../controllers/messageController';

const router = express.Router();
const upload = multer();

// Ruta de prueba para verificar que el router funciona
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Ruta mensajes activa' });
});

// Rutas existentes
router.post('/', sendMessage);
router.get('/', getMessages);

// Enviar PDF de perfil de cliente por email con adjunto
router.post(
  '/send-email',
  upload.single('file'),
  async (req: Request & { file?: Express.Multer.File }, res: Response) => {
    try {
      const { to, subject, body } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No se envió ningún archivo.' });
      }

      await sendEmailWithAttachment(to, subject, body, {
        filename: file.originalname,
        content: file.buffer,
      });

      res.json({ ok: true });
    } catch (error: any) {
      console.error('Error enviando email:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
