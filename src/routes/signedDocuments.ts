// src/routes/signedDocuments.ts
import express from 'express';
import {
  sendDocumentForSignature,
  getPendingDocuments,
  signDocument,
  getSentDocuments,
  getSignedDocumentById, // ✅ IMPORTACIÓN AGREGADA
} from '../controllers/signDocumentController';

const router = express.Router();

// Ruta para registrar documento pendiente de firma
router.post('/', sendDocumentForSignature);

// Ruta para obtener los documentos pendientes de un cliente
router.get('/:clientId', getPendingDocuments);

// Ruta para obtener un documento individual por ID (para firmar)
router.get('/view/:id', getSignedDocumentById); // ✅ NUEVA RUTA

// Ruta para guardar la firma del documento
router.post('/sign', signDocument);

// Ruta para obtener documentos enviados por un usuario (agente/admin)
router.get('/sent/:userId', getSentDocuments);

export default router;
