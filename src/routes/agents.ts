// src/routes/agents.ts
import { Router } from 'express';
import {
  createAgent,
  getAllAgents,
  deleteAgent,
  deactivateAgent   // 👈 Asegúrate de importar el controlador
} from '../controllers/agentController';

const router = Router();

router.post('/', createAgent);
router.get('/', getAllAgents);
router.delete('/:id', deleteAgent);
router.post('/:id/deactivate', deactivateAgent); // 👈 Nueva ruta para desactivar agentes

export default router;
