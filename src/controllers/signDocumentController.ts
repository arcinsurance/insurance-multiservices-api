// src/controllers/signDocumentController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';

/* -------------------------------------------------------------------------- */
/*                      1. REGISTRAR DOCUMENTO A FIRMAR                       */
/* -------------------------------------------------------------------------- */
export const sendDocumentForSignature = async (req: Request, res: Response) => {
  try {
    const { clientId, templateId } = req.body;

    if (!clientId || !templateId) {
      return res.status(400).json({ error: 'Faltan clientId o templateId' });
    }

    // Validar existencia del cliente
    const [clientRows]: any = await db.execute(
      'SELECT id FROM clients WHERE id = ? LIMIT 1',
      [clientId]
    );
    if (clientRows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Validar existencia de la plantilla
    const [templateRows]: any = await db.execute(
      'SELECT id FROM document_templates WHERE id = ? LIMIT 1',
      [templateId]
    );
    if (templateRows.length === 0) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }

    // Insertar documento pendiente
    await db.execute(
      `INSERT INTO signed_documents 
        (client_id, template_id, status, created_at)
        VALUES (?, ?, 'pendiente', NOW())`,
      [clientId, templateId]
    );

    return res.status(201).json({ message: 'Documento enviado para firma correctamente' });
  } catch (error) {
    console.error('❌ Error al enviar documento para firma:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/* -------------------------------------------------------------------------- */
/*                     2. OBTENER DOCUMENTOS PENDIENTES                       */
/* -------------------------------------------------------------------------- */
export const getPendingDocuments = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    const [rows]: any = await db.execute(
      `
      SELECT sd.*, dt.name AS template_name, dt.content AS template_content
      FROM signed_documents sd
      JOIN document_templates dt ON sd.template_id = dt.id
      WHERE sd.client_id = ? AND sd.status = 'pendiente'
      ORDER BY sd.created_at DESC
      `,
      [clientId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Error al obtener documentos pendientes:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/* -------------------------------------------------------------------------- */
/*                       3. GUARDAR FIRMA DEL DOCUMENTO                       */
/* -------------------------------------------------------------------------- */
export const signDocument = async (req: Request, res: Response) => {
  try {
    const { documentId, fileUrl } = req.body;

    if (!documentId || !fileUrl) {
      return res.status(400).json({ error: 'Faltan documentId o fileUrl' });
    }

    await db.execute(
      `UPDATE signed_documents 
       SET file_url = ?, signed_at = NOW(), status = 'firmado'
       WHERE id = ?`,
      [fileUrl, documentId]
    );

    return res.status(200).json({ message: 'Documento firmado exitosamente' });
  } catch (error) {
    console.error('❌ Error al firmar documento:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
