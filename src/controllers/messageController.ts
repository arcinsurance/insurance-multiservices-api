// src/controllers/messageController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';
import {
  sendSystemMessageEmail,
  sendClientMessageEmail,
} from '../utils/emailService';

/* -------------------------------------------------------------------------- */
/*                            CONTROLADOR: ENVIAR                             */
/* -------------------------------------------------------------------------- */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    console.log('📥 Body recibido por el backend:', req.body);

    const {
      recipientId,
      recipientType, // 'client' | 'agent'
      subject,
      content,
      type, // por ahora solo 'EMAIL'
      senderId,
    } = req.body;

    /* 🚦 Validaciones básicas */
    if (!recipientId) {
      return res.status(400).json({ error: 'Falta recipientId' });
    }
    if (!['client', 'agent'].includes(recipientType)) {
      return res
        .status(400)
        .json({ error: 'recipientType inválido (client | agent)' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Falta content' });
    }
    if (type !== 'EMAIL') {
      return res
        .status(400)
        .json({ error: 'type inválido (por ahora debe ser "EMAIL")' });
    }
    if (!senderId) {
      return res.status(400).json({ error: 'Falta senderId' });
    }

    /* 1️⃣ Guardar mensaje */
    const insertValues = [
      recipientId,
      recipientType,
      subject || null,
      content,
      type,
      senderId,
      'enviado',
    ];

    console.log('📨 Insertando mensaje con valores:', insertValues);

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
      insertValues
    );

    /* 2️⃣ Obtener email del destinatario */
    let recipientEmail: string | null = null;

    if (recipientType === 'client') {
      const [rows]: any = await db.execute(
        `SELECT email FROM clients WHERE id = ? LIMIT 1`,
        [recipientId]
      );
      if (rows.length) recipientEmail = rows[0].email;
    } else {
      const [rows]: any = await db.execute(
        `SELECT email FROM agents WHERE id = ? LIMIT 1`,
        [recipientId]
      );
      if (rows.length) recipientEmail = rows[0].email;
    }

    /* 3️⃣ Obtener nombre del agente remitente (para firma) */
    let senderName = 'Un agente de nuestro equipo';
    const [senderRows]: any = await db.execute(
      `SELECT full_name FROM agents WHERE id = ? LIMIT 1`,
      [senderId]
    );
    if (senderRows.length) senderName = senderRows[0].full_name;

    if (!recipientEmail) {
      return res
        .status(404)
        .json({ error: `${recipientType === 'agent' ? 'Agente' : 'Cliente'} no encontrado` });
    }

    /* 4️⃣ Enviar correo */
    if (recipientType === 'client') {
      await sendClientMessageEmail(recipientEmail, subject, content, senderName);
    } else {
      await sendSystemMessageEmail(recipientEmail, subject, content);
    }

    /* 5️⃣ Devolver mensaje recién creado para el historial */
    const [result]: any = await db.execute(
      `SELECT 
         m.*, 
         CASE 
           WHEN m.recipient_type = 'client' THEN c.name 
           WHEN m.recipient_type = 'agent' THEN a.full_name 
           ELSE NULL 
         END AS recipientName,
         s.full_name AS senderName
       FROM messages m
       LEFT JOIN clients c ON m.recipient_type = 'client' AND m.recipient_id = c.id
       LEFT JOIN agents  a ON m.recipient_type = 'agent'  AND m.recipient_id = a.id
       LEFT JOIN agents  s ON m.sender_id = s.id
       WHERE m.recipient_id = ? AND m.sender_id = ? AND m.sent_date IS NOT NULL
       ORDER BY m.sent_date DESC LIMIT 1`,
      [recipientId, senderId]
    );

    return res.status(201).json(result[0]);

  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/* -------------------------------------------------------------------------- */
/*                           CONTROLADOR: HISTORIAL                           */
/* -------------------------------------------------------------------------- */
export const getMessages = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.execute(
      `
      SELECT 
        m.*,
        CASE
          WHEN m.recipient_type = 'client' THEN c.name
          WHEN m.recipient_type = 'agent'  THEN a.full_name
          ELSE NULL
        END AS recipientName,
        s.full_name AS senderName
      FROM messages m
      LEFT JOIN clients c ON m.recipient_type = 'client' AND m.recipient_id = c.id
      LEFT JOIN agents  a ON m.recipient_type = 'agent'  AND m.recipient_id = a.id
      LEFT JOIN agents  s ON m.sender_id = s.id
      ORDER BY m.sent_date DESC
      `
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Error al obtener mensajes:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
