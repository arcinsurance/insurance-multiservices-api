import express from 'express';
import {
  sendDocumentForSignature,
  getPendingDocuments,
  signDocument,
  getSentDocuments,
  getSignedDocumentById,
  updateSignedDocumentStatus,  // Importar la función
} from '../controllers/signDocumentController';

const router = express.Router();

// ✅ Ruta para obtener un documento individual por ID (pública)
router.get('/view/:id', getSignedDocumentById);

// ✅ Ruta para obtener documentos enviados por un usuario (protegida)
router.get('/sent/:userId', getSentDocuments);

// Ruta para registrar documento pendiente de firma (protegida)
router.post('/', sendDocumentForSignature);

// Ruta para obtener los documentos pendientes de un cliente (protegida)
router.get('/:clientId', getPendingDocuments);

// Ruta para guardar la firma del documento (protegida)
router.post('/sign', signDocument);

// ✅ NUEVA: Ruta para actualizar el estado del documento (protegida)
router.put('/:documentId/status', updateSignedDocumentStatus);

export default router;
