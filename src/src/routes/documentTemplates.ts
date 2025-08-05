// src/routes/documentTemplates.ts
import express from 'express';
import {
  getAllDocumentTemplates,
  getDocumentTemplateById,  // <-- importar esto
  createDocumentTemplate,
  updateDocumentTemplate,
  deleteDocumentTemplate,
} from '../controllers/documentTemplatesController';

const router = express.Router();

// Obtener todas las plantillas
router.get('/', getAllDocumentTemplates);

// Obtener una plantilla por ID
router.get('/:id', getDocumentTemplateById);  // <-- ESTA ES LA RUTA QUE FALTABA

// Crear una nueva plantilla
router.post('/', createDocumentTemplate);

// Actualizar una plantilla existente
router.put('/:id', updateDocumentTemplate);

// Eliminar una plantilla
router.delete('/:id', deleteDocumentTemplate);

export default router;
