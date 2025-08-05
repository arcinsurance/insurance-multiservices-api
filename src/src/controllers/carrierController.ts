import { Request, Response } from 'express';
import { db } from '../config/db';

export const getCarriers = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM carriers');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching carriers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCarrier = async (req: Request, res: Response) => {
  try {
    const { name, code } = req.body;
    const [result] = await db.execute(
      'INSERT INTO carriers (name, code) VALUES (?, ?)',
      [name, code]
    );
    res.status(201).json({ id: (result as any).insertId, name, code });
  } catch (err) {
    console.error('Error creating carrier:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCarrier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    const [result] = await db.execute(
      'UPDATE carriers SET name = ?, code = ? WHERE id = ?',
      [name, code, id]
    );
    if ((result as any).affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ id, name, code });
  } catch (err) {
    console.error('Error updating carrier:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCarrier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM carriers WHERE id = ?', [id]);
    if ((result as any).affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting carrier:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
