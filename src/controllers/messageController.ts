// src/controllers/messageController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';

/* -------------------------------------------------------------------------- */
/*                       CONTROLADOR  :  ENVIAR  MENSAJE                       */
/* -------------------------------------------------------------------------- */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    /* 1️⃣  LOG de depuración: ver exactamente qué llega */
    console.log('📥 Body recibido por el backend:', req.body);

    const {
      recipientId,
      recipientType, // debe ser 'client' o 'agent'
      subject,       // opcional
      content,       // obligatorio
      type,          // por ahora aceptamos solo 'EMAIL'
      senderId,      // id del usuario que envía
    } = req.body;

    /* 2️⃣  Validaciones con respuesta detallada */
    if (!recipientId)
      return res.status(400).json({ error: 'Falta recipientId' });

    if (!recipientType || !['client', 'agent'].includes(recipientType))
      return res.status(400).json({
        error: 'recipientType inválido (debe ser "client" o "agent")',
      });

    if (!content || content.trim() === '')
      return res.status(400).json({ error: 'Falta content' });

    if (!type || type !== 'EMAIL')
      return res
        .status(400)
        .json({ error: 'type inválido (por ahora debe ser "EMAIL")' });

    if (!senderId)
      return res.status(400).json({ error: 'Falta senderId' });

    /* 3️⃣  Construimos array de valores (en el mismo orden del INSERT) */
    const values = [
      recipientId,
      recipientType,
      subject || null, // si no hay asunto enviamos NULL
      content,
      type,
      senderId,
      'enviado',       // status inicial
    ];

    console.log('📨 Insertando mensaje con valores:', values);

    /* 4️⃣  Ejecutamos el INSERT */
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

    /* 5️⃣  Todo OK */
    return res
      .status(201)
      .json({ message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error);
    return res
      .status(500)
      .json({ error: 'Error interno del servidor' });
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
    return res
      .status(500)
      .json({ error: 'Error interno del servidor' });
  }
};
