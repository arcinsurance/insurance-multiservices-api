// src/controllers/documentController.ts
import { Request, Response } from 'express';

export const sendDocumentController = async (req: Request, res: Response) => {
  const { clientId, templateId } = req.body;

  if (!clientId || !templateId) {
    return res.status(400).json({ error: 'Missing clientId or templateId' });
  }

  try {
    // Simulamos el envío
    console.log(`📨 Enviando documento ${templateId} al cliente ${clientId}`);

    // Aquí podrías hacer: envío por email, creación de PDF, llamada a API externa, etc.

    return res.status(200).json({ message: 'Documento enviado exitosamente' });
  } catch (error) {
    console.error('Error enviando documento:', error);
    return res.status(500).json({ error: 'Error interno al enviar el documento' });
  }
};
