import { Request, Response } from 'express';
import { db } from '../config/db';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const {
      recipientId,
      recipientType,
      subject,
      content,
      type,
      senderId,
    } = req.body;

    // Validación básica
    if (!recipientId || !recipientType || !content || !type || !senderId) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Usar null en lugar de undefined si falta algún valor opcional
    const safeSubject = subject ?? null;

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
        safeSubject,
        content,
        type,
        senderId,
        'enviado'
      ]
    );

    return res.status(201).json({ message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
