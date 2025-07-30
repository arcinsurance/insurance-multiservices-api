import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

export const sendTestEmail = async (_req: Request, res: Response) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Insurance Multiservices" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'Test email nodemailer desde Render',
      text: 'Este es un correo de prueba para verificar configuración SMTP.',
    });
    res.json({ message: 'Correo de prueba enviado', messageId: info.messageId });
  } catch (error) {
    res.status(500).json({ error: 'Error enviando correo', details: error });
  }
};
