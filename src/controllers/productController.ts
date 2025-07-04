import { Request, Response } from 'express';
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE is_active = 1');
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error getting products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const id = uuidv4();
    await db.query(
      'INSERT INTO products (id, name, description) VALUES (?, ?, ?)',
      [id, name, description]
    );
    res.status(201).json({ id, name, description });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    console.error
