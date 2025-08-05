import express from 'express';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  updateClientEmployment,
  updateClientImmigration,
  updateClientAddresses
} from '../controllers/clientController';

import { createPolicy } from '../controllers/policyController';

const router = express.Router();

// Clientes
router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

// 🆕 Detalles adicionales del cliente
router.put('/:id/employment', updateClientEmployment);
router.put('/:id/immigration', updateClientImmigration);
router.put('/:id/addresses', updateClientAddresses);

// 🆕 Agregar póliza
router.post('/:clientId/policies', createPolicy);

export default router;
