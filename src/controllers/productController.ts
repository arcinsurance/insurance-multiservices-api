import { Request, Response } from 'express';
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

/* -------------------------------------------------------- */
/* 1. Crear un nuevo producto                               */
/* -------------------------------------------------------- */
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description = '', is_active = true } = req.body;
    // Avoid creating duplicate products by name (case insensitive).
    // Check if a product with the same name already exists.
    const [existing] = await db.query(
      `SELECT id FROM products WHERE LOWER(name) = LOWER(?) LIMIT 1`,
      [name]
    ) as any;
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Product with this name already exists' });
    }
    const productId = uuidv4();
    await db.query(
      `INSERT INTO products (id, name, description, is_active)
       VALUES (?, ?, ?, ?)`,
      [productId, name, description, is_active]
    );
    res.status(201).json({ message: 'Product created', id: productId });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* -------------------------------------------------------- */
/* 2. Obtener todos los productos                           */
/* -------------------------------------------------------- */
export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* -------------------------------------------------------- */
/* 3. Actualizar producto                                   */
/* -------------------------------------------------------- */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    await db.query(
      `UPDATE products
       SET name = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, description, is_active, id]
    );

    res.status(200).json({ message: 'Product updated' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* -------------------------------------------------------- */
/* 4. Eliminar producto                                     */
/* -------------------------------------------------------- */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM products WHERE id = ?', [id]);

    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
