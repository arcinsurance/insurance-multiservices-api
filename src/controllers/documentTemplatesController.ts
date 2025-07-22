import { Request, Response } from 'express';
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

/* -------------------------------------------------------------------------- */
/* Obtener todas las plantillas de documentos                                */
/* -------------------------------------------------------------------------- */
export const getAllDocumentTemplates = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM document_templates');
    res.json(rows);
  } catch (error) {
    console.error('Error getting document templates:', error);
    res.status(500).json({ error: 'Error getting document templates' });
  }
};

/* -------------------------------------------------------------------------- */
/* Crear una nueva plantilla de documento                                    */
/* -------------------------------------------------------------------------- */
export const createDocumentTemplate = async (req: Request, res: Response) => {
  try {
    const { name, category, content } = req.body;

    if (!name || !category || !content) {
      return res.status(400).json({ error: 'Name, category, and content are required' });
    }

    const id = uuidv4(); // 🔥 Generar ID único

    await db.query(
      'INSERT INTO document_templates (id, name, category, content, created_at) VALUES (?, ?, ?, ?, NOW())',
      [id, name, category, content]
    );

    res.status(201).json({
      id,
      name,
      category,
      content
    });
  } catch (error) {
    console.error('Error creating document template:', error);
    res.status(500).json({ error: 'Error creating document template' });
  }
};

/* -------------------------------------------------------------------------- */
/* Actualizar una plantilla existente                                        */
/* -------------------------------------------------------------------------- */
export const updateDocumentTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, content } = req.body;

    if (!name || !category || !content) {
      return res.status(400).json({ error: 'Name, category, and content are required' });
    }

    await db.query(
      'UPDATE document_templates SET name = ?, category = ?, content = ? WHERE id = ?',
      [name, category, content, id]
    );

    res.json({ id, name, category, content });
  } catch (error) {
    console.error('Error updating document template:', error);
    res.status(500).json({ error: 'Error updating document template' });
  }
};

/* -------------------------------------------------------------------------- */
/* Eliminar una plantilla de documento                                       */
/* -------------------------------------------------------------------------- */
export const deleteDocumentTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM document_templates WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting document template:', error);
    res.status(500).json({ error: 'Error deleting document template' });
  }
};
