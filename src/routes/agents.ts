// src/routes/agents.ts
import { Router } from 'express';
import { createAgent, getAllAgents } from '../controllers/agentController';

const router = Router();

router.post('/', createAgent);
router.get('/', getAllAgents);

export default router;
