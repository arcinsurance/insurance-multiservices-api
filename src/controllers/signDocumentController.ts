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
    console.log('📩 Body recibido en sendDocumentForSignature:', req.body);

    const { clientId, templateId, sentById } = req.body;

    if (!clientId || !templateId || !sentById) {
      return res.status(400).json({ error: 'Faltan clientId, templateId o sentById' });
    }

    const [clientRows]: any = await db.execute(
      'SELECT id, name, email, agent_id FROM clients WHERE id = ? LIMIT 1',
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

    const [agentRows]: any = await db.execute(
      'SELECT full_name, phone, email FROM agents WHERE id = ? LIMIT 1',
      [client.agent_id]
    );
    const agent = agentRows[0] ?? {
      full_name: 'nuestro equipo',
      phone: '(813) 885-5296',
      email: 'info@insurancemultiservices.com',
    };

    const combinedData = { client, agent };
    const originalContent = replaceDynamicTags(template.content, combinedData);

    const header = `
      <div style="border-bottom:1px solid #ccc; padding-bottom:10px; margin-bottom:20px;">
        <h2 style="margin:0; font-size:1.4em;">Insurance Multiservices</h2>
        <p style="margin:0;">7902 W Waters Ave. Ste Tampa, FL 33615</p>
        <p style="margin:0;">Tel: (813) 885-5296</p>
      </div>
    `;

    const footer = `
      <div style="border-top:1px solid #ccc; padding-top:10px; margin-top:20px; font-size:0.85em; color:#555;">
        <p>Este documento ha sido generado por Insurance Multiservices para fines de consentimiento y verificación del cliente.</p>
      </div>
    `;

    const fullContent = `${header}${originalContent}${footer}`;

    const [result]: any = await db.execute(
      `INSERT INTO signed_documents
       (client_id, template_id, content, sent_by_id, status, created_at)
       VALUES (?, ?, ?, ?, 'pendiente', NOW())`,
      [clientId, templateId, fullContent, sentById]
    );

    console.log('✅ Documento insertado correctamente con ID:', result.insertId);

    const documentId = result.insertId;
    const signLink = `${FRONTEND_URL}/firmar/${documentId}`;
    console.log('🔗 Enlace de firma generado:', signLink);

    const currentHour = new Date().getHours();
    let saludo = 'Hola';
    if (currentHour < 12) saludo = 'Buenos días';
    else if (currentHour < 18) saludo = 'Buenas tardes';
    else saludo = 'Buenas noches';

    const agentName = agent.full_name;
    const agentPhone = agent.phone;
    const agentEmail = agent.email;

    const subject = `Tu agente te envió un documento para firmar`;

    const body = `
      <p>${saludo} ${client.name},</p>

      <p>Tu agente <strong>${agentName}</strong> te ha enviado un documento para tu firma digital.</p>

      <p style="margin-bottom: 20px;">Por favor revísalo y fírmalo usando el siguiente botón:</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${signLink.trim()}" style="
          background-color: #007bff;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          display: inline-block;
          font-weight: bold;
          font-size: 16px;
        ">
          Firmar Documento
        </a>
      </div>

      <p>Si tienes alguna duda, no dudes en comunicarte conmigo.</p>

      <p>Atentamente,<br>
      ${agentName}<br>
      Teléfono: ${agentPhone}<br>
      Email: ${agentEmail}</p>
    `;

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

/* -------------------------------------------------------------------------- */
/* 5. OBTENER DOCUMENTO INDIVIDUAL PARA FIRMA                                 */
/* -------------------------------------------------------------------------- */
export const getSignedDocumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [docRows]: any = await db.execute(
      `SELECT sd.*, c.name AS client_name, a.full_name AS agent_name
       FROM signed_documents sd
       JOIN clients c ON sd.client_id = c.id
       JOIN agents a ON c.agent_id = a.id
       WHERE sd.id = ?`,
      [id]
    );

    if (docRows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const document = docRows[0];

    const [clientRows]: any = await db.execute('SELECT * FROM clients WHERE id = ?', [document.client_id]);
    const client = clientRows[0];

    const [addressRows]: any = await db.execute('SELECT * FROM addresses WHERE client_id = ?', [client.id]);
    const physicalAddress = addressRows.find((a: any) => a.type === 'physical') ?? {};
    const mailingAddress = addressRows.find((a: any) => a.type === 'mailing') ?? {};

    const [immigrationRows]: any = await db.execute('SELECT * FROM immigration_details WHERE client_id = ?', [client.id]);
    const [incomeRows]: any = await db.execute('SELECT * FROM income_sources WHERE client_id = ?', [client.id]);

    client.physicalAddress = physicalAddress;
    client.mailingAddress = mailingAddress;
    client.immigrationDetails = immigrationRows[0] ?? {};
    client.incomeSources = incomeRows;

    const [agentRows]: any = await db.execute('SELECT full_name, email, phone FROM agents WHERE id = ?', [client.agent_id]);
    const agent = agentRows[0];

    return res.status(200).json({
      ...document,
      client,
      agent,
    });
  } catch (error) {
    console.error('❌ Error al obtener documento firmado:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
