import { Request, Response } from 'express';
import { db } from '../db';  // Importa la conexión llamada "db"

export const getLeads = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM leads ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo leads', error });
  }
};

export const createLead = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Nombre y email son obligatorios' });
    }

    const [result] = await db.query(
      'INSERT INTO leads (name, email, phone, message) VALUES (?, ?, ?, ?)',
      [name, email, phone || null, message || null]
    );

    res.status(201).json({
      id: (result as any).insertId,
      name,
      email,
      phone,
      message,
      created_at: new Date(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creando lead', error });
  }
};
