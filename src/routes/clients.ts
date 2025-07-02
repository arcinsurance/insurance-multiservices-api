import express from 'express';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient
} from '../controllers/clientController';

const router = express.Router();

router.get('/', getClients);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;