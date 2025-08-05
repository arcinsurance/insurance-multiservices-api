import { Request, Response } from 'express';
import { db } from '../config/db';

export const getAgencyLicenses = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM agency_licenses');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching agency licenses:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAgencyLicense = async (req: Request, res: Response) => {
  try {
    const { state, licenseNumber, expiryDate } = req.body;
    const [result] = await db.execute(
      'INSERT INTO agency_licenses (state, license_number, expiry_date) VALUES (?, ?, ?)',
      [state, licenseNumber, expiryDate]
    );
    res.status(201).json({ id: (result as any).insertId, state, licenseNumber, expiryDate });
  } catch (err) {
    console.error('Error creating agency license:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAgencyLicense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { state, licenseNumber, expiryDate } = req.body;
    const [result] = await db.execute(
      'UPDATE agency_licenses SET state = ?, license_number = ?, expiry_date = ? WHERE id = ?',
      [state, licenseNumber, expiryDate, id]
    );
    if ((result as any).affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ id, state, licenseNumber, expiryDate });
  } catch (err) {
    console.error('Error updating agency license:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAgencyLicense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM agency_licenses WHERE id = ?', [id]);
    if ((result as any).affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting agency license:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
