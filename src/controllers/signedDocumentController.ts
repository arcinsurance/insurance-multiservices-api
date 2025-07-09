// src/controllers/signedDocumentController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';

/* -------------------------------------------------------------------------- */
/*                1️⃣ CONTROLADOR: ENVIAR DOCUMENTO A FIRMA                  */
/* -------------------------------------------------------------------------- */
export const sendDocumentForSignature = async (req: Request, res: Response) => {
  try {
    const { clientId, templateId } = req.body;

    if (!clientId || !templateId) {
      return res.status(400).json({ error: 'Faltan campos requeridos (clientId, templateId)' });
    }

    await db.execute(
      `INSERT INTO signed_documents (client_id, template_id, status)
       VALUES (?, ?, 'pendiente')`,
      [clientId, templateId]
    );

    return res.status(201).json({ message: 'Documento enviado correctamente para firma' });
  } catch (error) {
    console.error('❌ Error al enviar documento para firma:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/* -------------------------------------------------------------------------- */
/*         2️⃣ CONTROLADOR: OBTENER DOCUMENTOS ASIGNADOS AL CLIENTE         */
/* -------------------------------------------------------------------------- */
export const getDocumentsByClient = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    const [rows] = await db.execute(
      `SELECT d.*, t.name AS templateName, t.content AS templateContent
       FROM signed_documents d
       JOIN document_templates t ON d.template_id = t.id
       WHERE d.client_id = ?
       ORDER BY d.created_at DESC`,
      [clientId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Error al obtener documentos del cliente:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/* -------------------------------------------------------------------------- */
/*               3️⃣ CONTROLADOR: ACTUALIZAR FIRMA Y ESTADO                 */
/* -------------------------------------------------------------------------- */
export const completeSignature = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: 'Falta la URL del archivo firmado' });
    }

    await db.execute(
      `UPDATE signed_documents
       SET file_url = ?, signed_at = NOW(), status = 'firmado'
       WHERE id = ?`,
      [fileUrl, documentId]
    );

    return res.status(200).json({ message: 'Firma registrada correctamente' });
  } catch (error) {
    console.error('❌ Error al completar la firma:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
