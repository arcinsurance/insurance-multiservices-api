import { Router } from 'express';
import { getLeads, createLead } from '../controllers/leadController';

const router = Router();

router.get('/', getLeads);
router.post('/', createLead);

export default router;
