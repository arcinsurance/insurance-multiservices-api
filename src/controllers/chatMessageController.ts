import { Request, Response } from 'express';
import { db } from '../config/db';

export const getChatMessages = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM chat_messages ORDER BY timestamp ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching chat messages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createChatMessage = async (req: Request, res: Response) => {
  try {
    const { senderId, recipientId, content, timestamp } = req.body;
    const [result] = await db.execute(
      'INSERT INTO chat_messages (sender_id, recipient_id, content, timestamp) VALUES (?, ?, ?, ?)',
      [senderId, recipientId, content, timestamp || new Date()]
    );
    res.status(201).json({ id: (result as any).insertId, senderId, recipientId, content, timestamp });
  } catch (err) {
    console.error('Error creating chat message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
