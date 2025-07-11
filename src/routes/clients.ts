import express from 'express';
import {
  getClients,
  getClientById, // ✅ importar
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController';

import { createPolicy } from '../controllers/policyController'; // 🆕 importar controlador de pólizas

const router = express.Router();

router.get('/', getClients);
router.get('/:id', getClientById); // ✅ esta es la ruta que te faltaba
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

// 🆕 Ruta para agregar una póliza a un cliente
router.post('/:clientId/policies', createPolicy);

export default router;
