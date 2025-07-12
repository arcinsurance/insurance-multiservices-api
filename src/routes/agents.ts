// src/routes/agents.ts
import { Router } from 'express';
import {
  createAgent,
  getAllAgents,
  deleteAgent,
  deactivateAgent,
  activateAgent    // 👈 IMPORTA el controlador para activar
} from '../controllers/agentController';

const router = Router();

router.post('/', createAgent);
router.get('/', getAllAgents);
router.delete('/:id', deleteAgent);

// Rutas para desactivar (compatibilidad POST/PATCH)
router.post('/:id/deactivate', deactivateAgent);
router.patch('/:id/deactivate', deactivateAgent);

// Rutas para activar (compatibilidad POST/PATCH)
router.post('/:id/activate', activateAgent);
router.patch('/:id/activate', activateAgent);

export default router;
