import { Router } from 'express';
import {
  getCarriers,
  createCarrier,
  updateCarrier,
  deleteCarrier,
} from '../controllers/carrierController';

const router = Router();

router.get('/', getCarriers);
router.post('/', createCarrier);
router.put('/:id', updateCarrier);
router.delete('/:id', deleteCarrier);

export default router;
