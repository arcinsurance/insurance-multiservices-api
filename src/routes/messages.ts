import express, { Request, Response } from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import { sendMessage, getMessages } from '../controllers/messageController';

const router = express.Router();
const upload = multer();

// --- Mensajes normales (esto ya lo tienes) ---
router.post('/', sendMessage);
router.get('/', getMessages);

// --- NUEVO: Enviar PDF de perfil de cliente por email ---
router.post(
  '/api/send-email',
  upload.single('file'),
  async (req: Request & { file?: Express.Multer.File }, res: Response) => {
    try {
      const { to, subject, body } = req.body;
      const file = req.file;

      // Configura el transporte de correo
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'TUCORREO@gmail.com',    // Cambia por tu email real
          pass: 'TU_CONTRASEÑA_APP'      // Contraseña de aplicación de Gmail
        }
      });

      const mailOptions = {
        from: 'TUCORREO@gmail.com',
        to,
        subject,
        text: body,
        attachments: file
          ? [{ filename: file.originalname, content: file.buffer }]
          : []
      };

      await transporter.sendMail(mailOptions);

      res.json({ ok: true });
    } catch (error: any) {
      console.error('Error enviando email:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
