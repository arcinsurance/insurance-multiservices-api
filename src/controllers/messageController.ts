// src/controllers/messageController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendMessage = async (req: Request, res: Response) => {
  try {
    console.log('📥 Body recibido por el backend:', req.body);

    const {
      recipientId,
      recipientType,
      subject,
      content,
      type,
      senderId,
    } = req.body;

    // 🔒 Validaciones
    if (!recipientId)
      return res.status(400).json({ error: 'Falta recipientId' });

    if (!recipientType || !['client', 'agent'].includes(recipientType))
      return res.status(400).json({
        error: 'recipientType inválido (debe ser "client" o "agent")',
      });

    if (!content || content.trim() === '')
      return res.status(400).json({ error: 'Falta content' });

    if (!type || type !== 'EMAIL')
      return res.status(400).json({
        error: 'type inválido (por ahora debe ser "EMAIL")',
      });

    if (!senderId)
      return res.status(400).json({ error: 'Falta senderId' });

    // 🔍 Buscar correo del destinatario
    const table = recipientType === 'client' ? 'clients' : 'users';
    const [rows]: any = await db.execute(
      `SELECT email FROM ${table} WHERE id = ?`,
      [recipientId]
    );

    const recipientEmail = rows?.[0]?.email;
    if (!recipientEmail) {
      return res.status(404).json({ error: 'Correo electrónico no encontrado' });
    }

    // 📧 Configurar transportador de Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // true para 465, false para 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 📨 Enviar correo
    await transporter.sendMail({
      from: `"Insurance Multiservices" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: subject || 'Sin asunto',
      text: content,
    });

    // 🗃️ Guardar mensaje en la base de datos
    const values = [
      recipientId,
      recipientType,
      subject || null,
      content,
      type,
      senderId,
      'enviado',
    ];

    console.log('📨 Insertando mensaje con valores:', values);

    await db.execute(
      `INSERT INTO messages (
        recipient_id,
        recipient_type,
        subject,
        content,
        type,
        sender_id,
        sent_date,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
      values
    );

    return res.status(201).json({ message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getMessages = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM messages ORDER BY sent_date DESC`
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Error al obtener mensajes:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
