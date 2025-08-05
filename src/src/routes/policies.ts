import express from 'express';
import { createPolicy } from '../controllers/policyController';

const router = express.Router();

// Ruta para agregar póliza
router.post('/:clientId', createPolicy);

export default router;
