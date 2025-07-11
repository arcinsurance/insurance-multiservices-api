// src/routes/settingsRoutes.ts
import express from 'express';
import {
  getAgencyProfile,
  updateAgencyProfile,
  getAppSettings,
  updateAppSettings,
} from '../controllers/settingsController';

const router = express.Router();

router.get('/agency-profile', getAgencyProfile);
router.put('/agency-profile', updateAgencyProfile);
router.get('/app-settings', getAppSettings);
router.put('/app-settings', updateAppSettings);

export default router;
