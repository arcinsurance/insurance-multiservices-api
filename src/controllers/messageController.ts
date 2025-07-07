import { Request, Response } from 'express';
import { db } from '../config/db';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { senderId, recipientId, recipientType, subject, content, type } = req.body;
    const sentDate = new Date().toISOString();

    await db.execute(
      `INSERT INTO messages (sender_id, recipient_id, recipient_type, subject, content, type, sent_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [senderId, recipientId, recipientType, subject, content, type, sentDate, 'enviado']
    );

    res.status(201).json({ message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
};

export const getMessages = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM messages ORDER BY sent_date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};
