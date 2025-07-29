import express from 'express';
import { getAllCarriers, getCarrierById, createCarrier, updateCarrier, deleteCarrier } from '../controllers/carrierController';

const router = express.Router();

router.get('/', getAllCarriers);
router.get('/:id', getCarrierById);
router.post('/', createCarrier);
router.put('/:id', updateCarrier);
router.delete('/:id', deleteCarrier);

export default router;
