import { Router } from 'express';
import {
  getCommissionRates,
  createCommissionRate,
  updateCommissionRate,
  deleteCommissionRate,
} from '../controllers/commissionRateController';

const router = Router();

router.get('/', getCommissionRates);
router.post('/', createCommissionRate);
router.put('/:id', updateCommissionRate);
router.delete('/:id', deleteCommissionRate);

export default router;
