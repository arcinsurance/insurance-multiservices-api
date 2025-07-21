// src/routes/documents.ts
import express from 'express';
import {
  sendDocumentForSignature,
  getPendingDocuments,
  signDocument,
  getSentDocuments,
  getSignedDocumentById,
} from '../controllers/signedDocumentsController';

const router = express.Router();

router.post('/send', sendDocumentForSignature); // Enviar documento para firma
router.get('/pending/:clientId', getPendingDocuments); // Ver documentos pendientes por cliente
router.post('/sign', signDocument); // Guardar firma
router.get('/sent/:userId', getSentDocuments); // Ver historial enviados
router.get('/:id', getSignedDocumentById); // Ver documento individual para firmar

export default router;
