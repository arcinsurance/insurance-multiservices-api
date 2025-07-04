import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';

/* ────────────────────────────
   GET /api/product-categories
   Devuelve todas las categorías
────────────────────────────── */
export const getAllProductCategories = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM product_categories ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching product categories:', error);
    res.status(500).json({ message: 'Error fetching product categories' });
  }
};

/* ────────────────────────────
   POST /api/product-categories
   Crea una nueva categoría
────────────────────────────── */
export const createProductCategory = async (req: Request, res: Response) => {
  const { name, description } = req.body;

  if (!name) return res.status(400).json({ message: 'Name is required' });

  try {
    const id = uuidv4();
    await db.query(
      'INSERT INTO product_categories (id, name, description) VALUES (?, ?, ?)',
      [id, name, description],
    );
    res.status(201).json({ id, name, description });
  } catch (error) {
    console.error('Error creating product category:', error);
    res.status(500).json({ message: 'Error creating product category' });
  }
};

/* ────────────────────────────
   PUT /api/product-categories/:id
   Actualiza una categoría
────────────────────────────── */
export const updateProductCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name) return res.status(400).json({ message: 'Name is required' });

  try {
    await db.query(
      'UPDATE product_categories SET name = ?, description = ? WHERE id = ?',
      [name, description, id],
    );
    res.status(200).json({ id, name, description });
  } catch (error) {
    console.error('Error updating product category:', error);
    res.status(500).json({ message: 'Error updating product category' });
  }
};

/* ────────────────────────────
   DELETE /api/product-categories/:id
   Elimina una categoría
────────────────────────────── */
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
