// src/routes/signDocuments.ts
import express from 'express';
import {
  sendDocumentForSignature,
  getPendingDocuments,
  signDocument,
} from '../controllers/signDocumentController';

const router = express.Router();

// 📤 Enviar documento a firma
router.post('/send', sendDocumentForSignature);

// 📥 Obtener documentos pendientes para un cliente
router.get('/pending/:clientId', getPendingDocuments);

// ✍️ Guardar la firma de un documento
router.post('/sign', signDocument);

export default router;
