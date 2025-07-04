import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';

export const getAllProductCategories = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM product_categories ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching product categories:', error);
    res.status(500).json({ message: 'Error fetching product categories' });
  }
};

export const createProductCategory = async (req: Request, res: Response) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    const id = uuidv4();
    await db.query(
      'INSERT INTO product_categories (id, name, description) VALUES (?, ?, ?)',
      [id, name, description]
    );
    res.status(201).json({ id, name, description });
  } catch (error) {
    console.error('Error creating product category:', error);
    res.status(500).json({ message: 'Error creating product category' });
  }
};

export const deleteProductCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM product_categories WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product category:', error);
    res.status(500).json({ message: 'Error deleting product category' });
  }
};
