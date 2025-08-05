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
      recipientType, // 'client' | 'allClients' | 'agent' | 'allAgents' | 'company' | 'state'
      subject,
      content,
      type, // por ahora solo 'EMAIL'
      senderId,
    } = req.body;

    // Validación básica
    if (!recipientType || !['client', 'allClients', 'agent', 'allAgents', 'company', 'state'].includes(recipientType)) {
      return res.status(400).json({ error: 'recipientType inválido' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Falta content' });
    }
    if (!senderId) {
      return res.status(400).json({ error: 'Falta senderId' });
    }
    if (!type || type !== 'EMAIL') {
      return res.status(400).json({ error: 'type inválido (por ahora debe ser "EMAIL")' });
    }
    // Para tipos que requieren id
    if (['client', 'agent', 'company', 'state'].includes(recipientType) && !recipientId) {
      return res.status(400).json({ error: 'Falta recipientId' });
    }

    // Recolecta destinatarios según tipo
    let emails: string[] = [];
    let recipientNames: string[] = [];

    if (recipientType === 'client') {
      // Cliente específico
      const [rows]: any = await db.execute(
        `SELECT email, name FROM clients WHERE id = ? LIMIT 1`,
        [recipientId]
      );
      if (rows.length) {
        emails.push(rows[0].email);
        recipientNames.push(rows[0].name);
      }
    } else if (recipientType === 'allClients') {
      // Todos los clientes
      const [rows]: any = await db.execute(`SELECT email, name FROM clients`);
      rows.forEach((row: any) => {
        if (row.email) emails.push(row.email);
        recipientNames.push(row.name);
      });
    } else if (recipientType === 'agent') {
      // Agente específico
      const [rows]: any = await db.execute(
        `SELECT email, full_name FROM agents WHERE id = ? LIMIT 1`,
        [recipientId]
      );
      if (rows.length) {
        emails.push(rows[0].email);
        recipientNames.push(rows[0].full_name);
      }
    } else if (recipientType === 'allAgents') {
      // Todos los agentes
      const [rows]: any = await db.execute(`SELECT email, full_name FROM agents`);
      rows.forEach((row: any) => {
        if (row.email) emails.push(row.email);
        recipientNames.push(row.full_name);
      });
    } else if (recipientType === 'company') {
      // Todos los clientes de una aseguradora específica
      const [rows]: any = await db.execute(
        `SELECT email, name FROM clients WHERE insurance_company_id = ?`,
        [recipientId]
      );
      rows.forEach((row: any) => {
        if (row.email) emails.push(row.email);
        recipientNames.push(row.name);
      });
    } else if (recipientType === 'state') {
      // Todos los clientes de un estado específico
      const [rows]: any = await db.execute(
        `SELECT email, name FROM clients WHERE state = ?`,
        [recipientId]
      );
      rows.forEach((row: any) => {
        if (row.email) emails.push(row.email);
        recipientNames.push(row.name);
      });
    }

    if (!emails.length) {
      return res.status(404).json({ error: 'No se encontraron destinatarios para este envío.' });
    }

    // Obtener nombre del agente remitente (firma)
    let senderName = 'Un agente de nuestro equipo';
    const [senderRows]: any = await db.execute(
      `SELECT full_name FROM agents WHERE id = ? LIMIT 1`,
      [senderId]
    );
    if (senderRows.length) senderName = senderRows[0].full_name;

    // Guardar mensajes en la base de datos (uno por destinatario)
    for (let i = 0; i < emails.length; i++) {
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
          recipientType === 'client' || recipientType === 'agent' ? recipientId : null, // Guarda id si es envío individual
          recipientType,
          subject || null,
          content,
          type,
          senderId,
          'enviado',
        ]
      );
    }

    // Envía correos (usa tu lógica para masivos)
    for (let i = 0; i < emails.length; i++) {
      try {
        if (recipientType === 'client' || recipientType === 'allClients' || recipientType === 'company' || recipientType === 'state') {
          await sendClientMessageEmail(emails[i], subject, content, senderName);
        } else {
          await sendSystemMessageEmail(emails[i], subject, content);
        }
      } catch (err) {
        console.error('❌ Error enviando email:', err);
      }
    }

    return res.status(201).json({ message: 'Mensajes enviados con éxito', total: emails.length });
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
