import express from 'express';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  getClientBasicInfo,
  getClientEmployment,
  getClientImmigration,
  getClientAddresses,
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

// Endpoints REST por sección (frontend espera estos)
router.get('/:id/basic-info', getClientBasicInfo);
router.get('/:id/employment', getClientEmployment);
router.get('/:id/immigration', getClientImmigration);
router.get('/:id/addresses', getClientAddresses);

// Endpoints para actualizar secciones específicas (deja el handler aunque solo sea un placeholder)
router.put('/:id/employment', updateClientEmployment);
router.put('/:id/immigration', updateClientImmigration);
router.put('/:id/addresses', updateClientAddresses);

// Agregar póliza a un cliente
router.post('/:clientId/policies', createPolicy);

export default router;
