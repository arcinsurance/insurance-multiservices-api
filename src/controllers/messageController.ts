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
      recipientType, // 'client' | 'allClients' | 'agent' | 'allAgents'
      subject,
      content,
      type, // 'EMAIL'
      senderId,
    } = req.body;

    // Validaciones generales
    if (!['client', 'allClients', 'agent', 'allAgents'].includes(recipientType)) {
      return res.status(400).json({ error: 'recipientType inválido (client, allClients, agent, allAgents)' });
    }
    if ((recipientType === 'client' || recipientType === 'agent') && !recipientId) {
      return res.status(400).json({ error: 'Falta recipientId' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Falta content' });
    }
    if (type !== 'EMAIL') {
      return res.status(400).json({ error: 'type inválido (por ahora debe ser "EMAIL")' });
    }
    if (!senderId) {
      return res.status(400).json({ error: 'Falta senderId' });
    }

    // Obtener nombre del remitente
    let senderName = 'Un agente de nuestro equipo';
    const [senderRows]: any = await db.execute(
      `SELECT full_name FROM agents WHERE id = ? LIMIT 1`,
      [senderId]
    );
    if (senderRows.length) senderName = senderRows[0].full_name;

    // Envío masivo a todos los clientes o agentes
    if (recipientType === 'allClients' || recipientType === 'allAgents') {
      const table = recipientType === 'allClients' ? 'clients' : 'agents';
      const [rows]: any = await db.execute(
        `SELECT id, email FROM ${table} WHERE email IS NOT NULL AND email <> ''`
      );
      if (!rows.length) {
        return res.status(404).json({ error: 'No se encontraron destinatarios.' });
      }

      for (const row of rows) {
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
          [
            row.id,
            table.slice(0, -1), // 'client' o 'agent'
            subject || null,
            content,
            type,
            senderId,
            'enviado'
          ]
        );
        if (recipientType === 'allClients') {
          await sendClientMessageEmail(row.email, subject, content, senderName);
        } else {
          await sendSystemMessageEmail(row.email, subject, content);
        }
      }
      return res.status(201).json({ success: true, message: `Mensaje enviado a ${rows.length} destinatarios.` });
    }

    // Envío individual a un cliente o agente
    let recipientEmail: string | null = null;
    if (recipientType === 'client') {
      const [rows]: any = await db.execute(
        `SELECT email FROM clients WHERE id = ? LIMIT 1`,
        [recipientId]
      );
      if (rows.length) recipientEmail = rows[0].email;
    } else if (recipientType === 'agent') {
      const [rows]: any = await db.execute(
        `SELECT email FROM agents WHERE id = ? LIMIT 1`,
        [recipientId]
      );
      if (rows.length) recipientEmail = rows[0].email;
    }
    if (!recipientEmail) {
      return res
        .status(404)
        .json({ error: `${recipientType === 'agent' ? 'Agente' : 'Cliente'} no encontrado` });
    }

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
      [
        recipientId,
        recipientType,
        subject || null,
        content,
        type,
        senderId,
        'enviado'
      ]
    );

    if (recipientType === 'client') {
      await sendClientMessageEmail(recipientEmail, subject, content, senderName);
    } else {
      await sendSystemMessageEmail(recipientEmail, subject, content);
    }

    return res.status(201).json({ success: true, message: 'Mensaje enviado con éxito.' });

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
