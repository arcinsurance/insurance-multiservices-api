import { Request, Response } from 'express';
import { db } from '../config/db';

export const getSettingsLog = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM settings_log ORDER BY timestamp DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching settings log:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
