import { Request, Response } from 'express';
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

/* -------------------------------------------------------------------------- */
/* OBTENER TODAS LAS PLANTILLAS                                               */
/* -------------------------------------------------------------------------- */
export const getAllDocumentTemplates = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.execute(
      'SELECT id, name, category, content, description, file_url, created_at FROM document_templates ORDER BY created_at DESC'
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Error al obtener plantillas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/* -------------------------------------------------------------------------- */
/* OBTENER UNA PLANTILLA POR ID                                               */
/* -------------------------------------------------------------------------- */
export const getDocumentTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await db.execute(
      'SELECT id, name, category, content, description, file_url, created_at FROM document_templates WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('❌ Error al obtener plantilla por ID:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/* -------------------------------------------------------------------------- */
/* CREAR UNA PLANTILLA NUEVA                                                  */
/* -------------------------------------------------------------------------- */
export const createDocumentTemplate = async (req: Request, res: Response) => {
  try {
    const { name, category, content, description, file_url } = req.body;

    if (!name || !content) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const id = uuidv4();
    await db.execute(
      `INSERT INTO document_templates (id, name, category, content, description, file_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, name, category || '', content, description || '', file_url || null]
    );

    return res.status(201).json({ message: 'Plantilla creada correctamente', id });
  } catch (error) {
    console.error('❌ Error al crear plantilla:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/* -------------------------------------------------------------------------- */
/* ACTUALIZAR PLANTILLA EXISTENTE                                             */
/* -------------------------------------------------------------------------- */
export const updateDocumentTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, content, description, file_url } = req.body;

    await db.execute(
      `UPDATE document_templates 
       SET name = ?, category = ?, content = ?, description = ?, file_url = ?
       WHERE id = ?`,
      [name, category || '', content, description || '', file_url || null, id]
    );

    return res.status(200).json({ message: 'Plantilla actualizada correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar plantilla:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/* -------------------------------------------------------------------------- */
/* ELIMINAR UNA PLANTILLA                                                     */
/* -------------------------------------------------------------------------- */
export const deleteDocumentTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM document_templates WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Plantilla eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar plantilla:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
