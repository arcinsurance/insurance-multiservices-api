// src/controllers/messageController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';
import { sendSystemMessageEmail } from '../utils/emailService';

/* -------------------------------------------------------------------------- */
/*                           CONTROLADOR: ENVIAR MENSAJE                      */
/* -------------------------------------------------------------------------- */
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

    // Validaciones
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

    /* ---------------------------------------------------------------------- */
    // 1️⃣ Buscar correo electrónico del destinatario
    let email = '';
    let fullName = '';

    if (recipientType === 'client') {
      const [rows]: any = await db.execute(
        'SELECT id, CONCAT(first_name, " ", last_name) AS fullName, email FROM clients WHERE id = ?',
        [recipientId]
      );

      if (!rows.length) return res.status(404).json({ error: 'Cliente no encontrado' });

      email = rows[0].email;
      fullName = rows[0].fullName;
    } else {
      const [rows]: any = await db.execute(
        'SELECT id, full_name, email FROM users WHERE id = ?',
        [recipientId]
      );

      if (!rows.length) return res.status(404).json({ error: 'Agente no encontrado' });

      email = rows[0].email;
      fullName = rows[0].full_name;
    }

    if (!email) return res.status(400).json({ error: 'Correo electrónico no encontrado' });

    /* ---------------------------------------------------------------------- */
    // 2️⃣ Insertar en base de datos
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

    /* ---------------------------------------------------------------------- */
    // 3️⃣ Enviar email
    await sendSystemMessageEmail(email, subject || 'Sin asunto', content);

    return res.status(201).json({ message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/* -------------------------------------------------------------------------- */
/*                      CONTROLADOR: OBTENER MENSAJES                         */
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
