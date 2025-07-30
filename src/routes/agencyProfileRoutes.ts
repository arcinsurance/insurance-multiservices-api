import { Router } from 'express';
import { getAgencyProfile, createOrUpdateAgencyProfile } from '../controllers/agencyProfileController';

const router = Router();

router.get('/', getAgencyProfile);
router.post('/', createOrUpdateAgencyProfile);

export default router;
