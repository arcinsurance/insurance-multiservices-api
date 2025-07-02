import express from 'express';
import { createAgent } from '../controllers/agentController';

const router = express.Router();

router.post('/', createAgent);

export default router;
