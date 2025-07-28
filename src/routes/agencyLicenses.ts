import { Router } from 'express';
import {
  getAgencyLicenses,
  createAgencyLicense,
  updateAgencyLicense,
  deleteAgencyLicense
} from '../controllers/agencyLicenseController';

const router = Router();

router.get('/', getAgencyLicenses);
router.post('/', createAgencyLicense);
router.put('/:id', updateAgencyLicense);
router.delete('/:id', deleteAgencyLicense);

export default router;
