// src/routes/agents.ts
import { Router } from 'express';
import {
  createAgent,
  getAllAgents,
  deleteAgent,
  deactivateAgent,
  activateAgent, // <-- AGREGA ESTA IMPORTACIÓN
} from '../controllers/agentController';

const router = Router();

router.post('/', createAgent);
router.get('/', getAllAgents);
router.delete('/:id', deleteAgent);

// Desactivar
router.post('/:id/deactivate', deactivateAgent);
router.patch('/:id/deactivate', deactivateAgent);

// ACTIVAR
router.post('/:id/activate', activateAgent);    // <-- OPCIONAL, para compatibilidad
router.patch('/:id/activate', activateAgent);   // <-- ESTA ES LA QUE NECESITAS

export default router;
