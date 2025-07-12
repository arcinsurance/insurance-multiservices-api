// src/routes/agents.ts
import { Router } from 'express';
import {
  createAgent,
  getAllAgents,
  deleteAgent,
  deactivateAgent
} from '../controllers/agentController';

const router = Router();

router.post('/', createAgent);
router.get('/', getAllAgents);
router.delete('/:id', deleteAgent);

// 👇 Ambas rutas: POST y PATCH para compatibilidad con cualquier frontend
router.post('/:id/deactivate', deactivateAgent);
router.patch('/:id/deactivate', deactivateAgent);

export default router;
