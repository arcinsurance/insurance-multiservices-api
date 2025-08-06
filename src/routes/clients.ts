import express from 'express';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  getClientBasicInfo,
  getClientEmployment,
  getClientImmigration,
  getClientAddresses
} from '../controllers/clientController';

import { createPolicy } from '../controllers/policyController';

const router = express.Router();

// Clientes
router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);

// Endpoints REST por sección (para compatibilidad con frontend existente)
router.get('/:id/basic-info', getClientBasicInfo);
router.get('/:id/employment', getClientEmployment);
router.get('/:id/immigration', getClientImmigration);
router.get('/:id/addresses', getClientAddresses);

// Agregar póliza a un cliente
router.post('/:clientId/policies', createPolicy);

export default router;
