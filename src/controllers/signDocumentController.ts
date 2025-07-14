import { Request, Response } from 'express';
import { db } from '../config/db';
import { sendEmail } from '../utils/emailService';
import { replaceDynamicTags } from '../utils/replaceDynamicTags';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://tusitio.com';

/* -------------------------------------------------------------------------- */
/* 1. REGISTRAR DOCUMENTO A FIRMAR Y ENVIAR EMAIL                             */
/* -------------------------------------------------------------------------- */
export const sendDocumentForSignature = async (req: Request, res: Response) => {
  try {
    const { clientId, templateId, sentById } = req.body;

    if (!clientId || !templateId || !sentById) {
      return res.status(400).json({ error: 'Faltan clientId, templateId o sentById' });
    }

    const [clientRows]: any = await db.execute(
      'SELECT * FROM clients WHERE id = ? LIMIT 1',
      [clientId]
    );
    if (clientRows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    const client = clientRows[0];

    const [addressRows]: any = await db.execute('SELECT * FROM addresses WHERE client_id = ?', [clientId]);
    const physicalAddress = addressRows.find((a: any) => a.type === 'physical') ?? {};
    const mailingAddress = addressRows.find((a: any) => a.type === 'mailing') ?? {};

    const [immigrationRows]: any = await db.execute('SELECT * FROM immigration_details WHERE client_id = ?', [clientId]);
    const [incomeRows]: any = await db.execute('SELECT * FROM income_sources WHERE client_id = ?', [clientId]);

    client.physicalAddress = physicalAddress;
    client.mailingAddress = mailingAddress;
    client.immigrationDetails = immigrationRows[0] ?? {};
    client.incomeSources = incomeRows;

    const [templateRows]: any = await db.execute(
      'SELECT id, content, name FROM document_templates WHERE id = ? LIMIT 1',
      [templateId]
    );
    if (templateRows.length === 0) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }
    const template = templateRows[0];

    const [agentRows]: any = await db.execute('SELECT * FROM agents WHERE id = ?', [client.agent_id]);
    const agent = agentRows[0];

    const personalizedContent = replaceDynamicTags(template.content, { client, agent });

    const [result]: any = await db.execute(
      `INSERT INTO signed_documents
       (client_id, template_id, content, sent_by_id, status, created_at)
       VALUES (?, ?, ?, ?, 'pendiente', NOW())`,
      [clientId, templateId, personalizedContent, sentById]
    );

    const documentId = result.insertId;
    const signLink = `${FRONTEND_URL}/firmar/${documentId}`;

    const subject = `Tu agente te envió un documento para firmar`;
    const body = `Hola ${client.name},\n\nTe han enviado un documento para firma. Haz clic en el siguiente enlace para firmarlo:\n\n${signLink}\n\nGracias.`;

    await sendEmail(client.email, subject, body);

    return res.status(201).json({ message: 'Documento enviado y correo enviado correctamente' });
  } catch (error) {
    console.error('❌ Error al enviar documento para firma:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/* -------------------------------------------------------------------------- */
/* 2. OBTENER DOCUMENTOS PENDIENTES                                           */
/* -------------------------------------------------------------------------- */
export const getPendingDocuments = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    const [rows]: any = await db.execute(
      `SELECT sd.*, dt.name AS template_name, dt.content AS template_content
       FROM signed_documents sd
       JOIN document_templates dt ON sd.template_id = dt.id
       WHERE sd.client_id = ? AND sd.status = 'pendiente'
       ORDER BY sd.created_at DESC`,
      [clientId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Error al obtener documentos pendientes:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/* -------------------------------------------------------------------------- */
/* 3. GUARDAR FIRMA DEL DOCUMENTO                                             */
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

/* -------------------------------------------------------------------------- */
/* 4. HISTORIAL DE DOCUMENTOS ENVIADOS                                        */
/* -------------------------------------------------------------------------- */
export const getSentDocuments = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const [rows]: any = await db.execute(
      `SELECT sd.id, sd.status, sd.created_at, sd.signed_at,
              c.name AS client_name, dt.name AS template_name
       FROM signed_documents sd
       JOIN clients c ON sd.client_id = c.id
       JOIN document_templates dt ON sd.template_id = dt.id
       WHERE sd.sent_by_id = ?
       ORDER BY sd.created_at DESC`,
      [userId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Error al obtener historial de documentos enviados:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
