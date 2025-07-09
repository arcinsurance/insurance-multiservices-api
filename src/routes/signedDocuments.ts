// src/routes/signedDocuments.ts
import express from 'express';
import {
  sendDocumentForSignature,
  getPendingDocuments,
  signDocument
} from '../controllers/signDocumentController';

const router = express.Router();

// Ruta para registrar documento pendiente de firma
router.post('/', sendDocumentForSignature);

// Ruta para obtener los documentos pendientes de un cliente
router.get('/:clientId', getPendingDocuments);

// Ruta para guardar la firma del documento
router.post('/sign', signDocument);

export default router;
