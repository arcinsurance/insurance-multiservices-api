// src/controllers/messageController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';

// 📤 Enviar un mensaje
export const sendMessage = async (req: Request, res: Response) => {
  try {
    // Mostrar qué se recibe
    console.log('📥 Body recibido por el backend:', req.body);

    const {
      recipientId,
      recipientType,
      subject,
      content,
      type,
      senderId,
    } = req.body;

    // Validación detallada para saber exactamente qué falta
    if (!recipientId) return res.status(400).json({ error: 'Falta recipientId' });
    if (!recipientType) return res.status(400).json({ error: 'Falta recipientType' });
    if (!content) return res.status(400).json({ error: 'Falta content' });
    if (!type) return res.status(400).json({ error: 'Falta type' });
    if (!senderId) return res.status(400).json({ error: 'Falta senderId' });

    const values = [
      recipientId ?? null,
      recipientType ?? null,
      subject ?? null,
      content ?? null,
      type ?? null,
      senderId ?? null,
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

// 📥 Obtener todos los mensajes (historial)
export const getMessages = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM messages ORDER BY sent_date DESC`
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Error al obtener mensajes:', error);
    return res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};
