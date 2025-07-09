import express from 'express';
import {
  sendDocumentForSignature,
  getDocumentsByClient,
  completeSignature,
} from '../controllers/signedDocumentController';

const router = express.Router();

// POST /api/signed-documents → Enviar un documento a firma
router.post('/', sendDocumentForSignature);

// GET /api/signed-documents/client/:clientId → Obtener documentos de un cliente
router.get('/client/:clientId', getDocumentsByClient);

// PUT /api/signed-documents/:id → Marcar documento como firmado
router.put('/:id', completeSignature);

export default router;
