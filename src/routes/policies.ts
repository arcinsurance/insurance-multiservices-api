// src/routes/policies.ts
import { Router } from 'express';
import {
  getPoliciesByClient,
  upsertPolicy,
  updatePolicy,
  deletePolicy,
} from '../controllers/policiesController';

const router = Router();

// Listar pólizas de un cliente
router.get('/client/:clientId', getPoliciesByClient);

// Crear/actualizar (upsert) póliza para un cliente
router.post('/client/:clientId', upsertPolicy);

// 🔁 Compatibilidad con tu ruta anterior: POST /api/policies/:clientId
router.post('/:clientId', upsertPolicy);

// Actualizar una póliza por id
router.put('/:policyId', updatePolicy);

// Eliminar una póliza por id
router.delete('/:policyId', deletePolicy);

export default router;
