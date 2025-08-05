import { Request, Response } from 'express';
import { db } from '../config/db';

export const getCommissionRates = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM commission_rates');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching commission rates:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCommissionRate = async (req: Request, res: Response) => {
  try {
    const { carrierName, state, productType, effectiveDate, rate } = req.body;
    const [result] = await db.execute(
      'INSERT INTO commission_rates (carrier_name, state, product_type, effective_date, rate) VALUES (?, ?, ?, ?, ?)',
      [carrierName, state, productType, effectiveDate, rate]
    );
    res.status(201).json({ id: (result as any).insertId, carrierName, state, productType, effectiveDate, rate });
  } catch (err) {
    console.error('Error creating commission rate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCommissionRate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { carrierName, state, productType, effectiveDate, rate } = req.body;
    const [result] = await db.execute(
      'UPDATE commission_rates SET carrier_name = ?, state = ?, product_type = ?, effective_date = ?, rate = ? WHERE id = ?',
      [carrierName, state, productType, effectiveDate, rate, id]
    );
    if ((result as any).affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ id, carrierName, state, productType, effectiveDate, rate });
  } catch (err) {
    console.error('Error updating commission rate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCommissionRate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM commission_rates WHERE id = ?', [id]);
    if ((result as any).affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting commission rate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
