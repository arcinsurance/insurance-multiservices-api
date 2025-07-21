// src/routes/signedDocuments.ts
import express from 'express';
import {
  sendDocumentForSignature,
  getPendingDocuments,
  signDocument,
  getSentDocuments,
  getSignedDocumentById,
} from '../controllers/signDocumentController';

const router = express.Router();

// ✅ Ruta para obtener documentos enviados por un usuario (antes de /:clientId)
router.get('/sent/:userId', getSentDocuments);

// ✅ Ruta para obtener un documento individual por ID (para firmar)
router.get('/view/:id', getSignedDocumentById);

// Ruta para registrar documento pendiente de firma
router.post('/', sendDocumentForSignature);

// Ruta para obtener los documentos pendientes de un cliente
router.get('/:clientId', getPendingDocuments);

// Ruta para guardar la firma del documento
router.post('/sign', signDocument);

export default router;
