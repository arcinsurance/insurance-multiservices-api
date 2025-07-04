// src/routes/agents.ts
import { Router } from 'express';
import {
  createAgent,
  getAllAgents,
  deleteAgent
} from '../controllers/agentController';

const router = Router();

router.post('/', createAgent);
router.get('/', getAllAgents);
router.delete('/:id', deleteAgent); // 👈 esta línea permite eliminar un agente

export default router;
