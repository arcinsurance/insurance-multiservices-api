// src/routes/documentTemplates.ts
import express from 'express';
import {
  getAllDocumentTemplates,
  createDocumentTemplate,
  updateDocumentTemplate,
  deleteDocumentTemplate,
} from '../controllers/documentTemplatesController';

const router = express.Router();

// Obtener todas las plantillas
router.get('/', getAllDocumentTemplates);

// Crear una nueva plantilla
router.post('/', createDocumentTemplate);

// Actualizar una plantilla existente
router.put('/:id', updateDocumentTemplate);

// Eliminar una plantilla
router.delete('/:id', deleteDocumentTemplate);

export default router;
