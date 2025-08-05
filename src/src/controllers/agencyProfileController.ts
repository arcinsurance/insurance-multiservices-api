import { Request, Response } from 'express';
import { db } from '../config/db';

export const getAgencyProfile = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM agency_profile LIMIT 1');
    if ((rows as any).length === 0) {
      return res.status(404).json({ message: 'No agency profile found' });
    }
    res.json((rows as any)[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching agency profile', error });
  }
};

export const createOrUpdateAgencyProfile = async (req: Request, res: Response) => {
  try {
    const { agency_name, address, phone, email, website } = req.body;

    // Validaciones básicas
    if (!agency_name) {
      return res.status(400).json({ message: 'agency_name is required' });
    }

    // Verificar si existe un perfil
    const [existingRows] = await db.query('SELECT * FROM agency_profile LIMIT 1');

    if ((existingRows as any).length > 0) {
      // Actualizar
      await db.query(
        `UPDATE agency_profile SET agency_name = ?, address = ?, phone = ?, email = ?, website = ?, updated_at = NOW() WHERE id = ?`,
        [agency_name, address || null, phone || null, email || null, website || null, (existingRows as any)[0].id]
      );

      return res.json({ message: 'Agency profile updated' });
    } else {
      // Crear nuevo
      const [result] = await db.query(
        `INSERT INTO agency_profile (agency_name, address, phone, email, website) VALUES (?, ?, ?, ?, ?)`,
        [agency_name, address || null, phone || null, email || null, website || null]
      );

      return res.status(201).json({ id: (result as any).insertId, message: 'Agency profile created' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error saving agency profile', error });
  }
};
