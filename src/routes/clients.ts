import express from 'express';
import {
  getClients,
  getClientById,
  createClient,
  updateClient
} from '../controllers/clientController';

import { createPolicy } from '../controllers/policyController';

const router = express.Router();

// Clientes
router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);

// Agregar póliza a un cliente
router.post('/:clientId/policies', createPolicy);

export default router;
