// src/routes/documentTemplates.ts
import express from 'express';
import {
  getDocumentTemplates, // ✅ Nombre correcto
  createDocumentTemplate,
  updateDocumentTemplate,
  deleteDocumentTemplate,
} from '../controllers/documentTemplatesController';

const router = express.Router();

// Obtener todas las plantillas
router.get('/', getDocumentTemplates);

// Crear una nueva plantilla
router.post('/', createDocumentTemplate);

// Actualizar una plantilla existente
router.put('/:id', updateDocumentTemplate);

// Eliminar una plantilla
router.delete('/:id', deleteDocumentTemplate);

export default router;
