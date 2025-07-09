// src/controllers/messageController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';
import { sendSystemMessageEmail, sendClientMessageEmail } from '../utils/emailService';

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

    if (!recipientId) return res.status(400).json({ error: 'Falta recipientId' });
    if (!recipientType || !['client', 'agent'].includes(recipientType))
      return res.status(400).json({ error: 'recipientType inválido (debe ser "client" o "agent")' });
    if (!content || content.trim() === '') return res.status(400).json({ error: 'Falta content' });
    if (!type || type !== 'EMAIL') return res.status(400).json({ error: 'type inválido (por ahora debe ser "EMAIL")' });
    if (!senderId) return res.status(400).json({ error: 'Falta senderId' });

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

    // 🔍 Buscar email del destinatario
    let recipientEmail: string | null = null;
    let senderName: string | null = null;

    if (recipientType === 'client') {
      const [rows]: any = await db.execute(
        `SELECT email FROM clients WHERE id = ? LIMIT 1`,
        [recipientId]
      );
      if (rows.length > 0) recipientEmail = rows[0].email;
    } else if (recipientType === 'agent') {
      const [rows]: any = await db.execute(
        `SELECT email FROM agents WHERE id = ? LIMIT 1`,
        [recipientId]
      );
      if (rows.length > 0) recipientEmail = rows[0].email;
    }

    // 🔍 Buscar nombre del agente remitente
    const [senderRows]: any = await db.execute(
      `SELECT full_name FROM agents WHERE id = ? LIMIT 1`,
      [senderId]
    );
    if (senderRows.length > 0) senderName = senderRows[0].full_name;

    if (!recipientEmail) {
      return res.status(404).json({ error: `${recipientType === 'agent' ? 'Agente' : 'Cliente'} no encontrado` });
    }

    // ✉️ Enviar email con estilo diferente según tipo
    if (recipientType === 'client') {
      await sendClientMessageEmail(recipientEmail, subject, content, senderName || 'Un agente de nuestro equipo');
    } else {
      await sendSystemMessageEmail(recipientEmail, subject, content);
    }

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
