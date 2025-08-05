import express from 'express';
import {
  sendDocumentForSignature,
  getPendingDocuments,
  signDocument,
  getSentDocuments,
  getSignedDocumentById,
  updateSignedDocumentStatus,
  getAllSignedDocuments,
} from '../controllers/signDocumentController';

const router = express.Router();

// ✅ Ruta para obtener un documento individual por ID (pública)
router.get('/view/:id', getSignedDocumentById);

// ✅ Ruta para obtener todos los documentos (protegida) para listar historial general
router.get('/', getAllSignedDocuments);

// ✅ Ruta para obtener documentos enviados por un usuario (protegida)
router.get('/sent/:userId', getSentDocuments);

// Ruta para registrar documento pendiente de firma (protegida)
router.post('/', sendDocumentForSignature);

// Alias: POST /send – equivalente a create document
router.post('/send', sendDocumentForSignature);

// Ruta para obtener los documentos pendientes de un cliente (protegida)
router.get('/:clientId', getPendingDocuments);

// Ruta para guardar la firma del documento (protegida)
router.post('/sign', signDocument);

// Alias: POST /:documentId/sign – firma documento por ID (para frontend)
router.post('/:documentId/sign', (req, res) => {
  // Insert documentId into body for controller
  req.body.documentId = req.params.documentId;
  return signDocument(req, res);
});

// ✅ NUEVA: Ruta para actualizar el estado del documento (protegida)
router.put('/:documentId/status', updateSignedDocumentStatus);

// Alias: PATCH /:documentId/status – actualiza el estado (para frontend)
router.patch('/:documentId/status', updateSignedDocumentStatus);

export default router;
