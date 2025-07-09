// src/controllers/messageController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/* -------------------------------------------------------------------------- */
/*                       CONTROLADOR  :  ENVIAR  MENSAJE                       */
/* -------------------------------------------------------------------------- */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    console.log('📥 Body recibido por el backend:', req.body);

    const {
      recipientId,
      recipientType, // 'client' o 'agent'
      subject,
      content,
      type,
      senderId,
    } = req.body;

    if (!recipientId)
      return res.status(400).json({ error: 'Falta recipientId' });

    if (!recipientType || !['client', 'agent'].includes(recipientType))
      return res
        .status(400)
        .json({ error: 'recipientType inválido (debe ser "client" o "agent")' });

    if (!content || content.trim() === '')
      return res.status(400).json({ error: 'Falta content' });

    if (!type || type !== 'EMAIL')
      return res
        .status(400)
        .json({ error: 'type inválido (por ahora debe ser "EMAIL")' });

    if (!senderId)
      return res.status(400).json({ error: 'Falta senderId' });

    /* 1️⃣ Consultar correo del destinatario */
    const table = recipientType === 'client' ? 'clients' : 'users';
    const [rows]: any = await db.execute(
      `SELECT email FROM ${table} WHERE id = ?`,
      [recipientId]
    );

    const recipientEmail = rows?.[0]?.email;
    if (!recipientEmail) {
      return res.status(404).json({ error: 'Correo electrónico no encontrado' });
    }

    /* 2️⃣ Configurar y enviar correo */
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Insurance Multiservices" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: subject || 'Sin asunto',
      text: content,
    });

    /* 3️⃣ Guardar en la base de datos */
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

/* -------------------------------------------------------------------------- */
/*                       CONTROLADOR : OBTENER MENSAJES                       */
/* -------------------------------------------------------------------------- */
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
