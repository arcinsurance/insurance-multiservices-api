// src/routes/messages.ts
import express, { Request, Response } from 'express';
import multer from 'multer';
import { sendEmail } from '../utils/emailService';

const router = express.Router();
const upload = multer();

// Rutas existentes
import { sendMessage, getMessages } from '../controllers/messageController';
router.post('/', sendMessage);
router.get('/', getMessages);

// Ruta para enviar PDF adjunto vía email usando emailService.ts
router.post(
  '/send-email',
  upload.single('file'),
  async (req: Request & { file?: Express.Multer.File }, res: Response) => {
    try {
      const { to, subject, body } = req.body;
      const file = req.file;

      if (!to || !subject) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: to o subject' });
      }

      if (file) {
        // Enviar email con adjunto
        await sendEmailWithAttachment(to, subject, body, file);
      } else {
        // Enviar email sin adjunto
        await sendEmail(to, subject, body);
      }

      res.json({ ok: true });
    } catch (error: any) {
      console.error('Error enviando email:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Función para enviar email con archivo adjunto usando transporter de emailService.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT ?? '465', 10),
  secure: true, // true para puerto 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // No verificar certificados auto-firmados
    rejectUnauthorized: false
  }
});

async function sendEmailWithAttachment(
  to: string,
  subject: string,
  text: string,
  file: Express.Multer.File
): Promise<void> {
  const mailOptions = {
    from: `"Insurance Multiservices" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    attachments: [
      {
        filename: file.originalname,
        content: file.buffer,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}

export default router;
