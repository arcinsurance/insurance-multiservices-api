import express from 'express';
import {
  getAgencyProfile,
  updateAgencyProfile,
  getAppSettings,
  updateAppSettings,
} from '../controllers/settingsController';

const router = express.Router();

// Ruta base para /api/settings
router.get('/', (_req, res) => {
  res.json({ message: 'Settings API is running. Use /agency-profile or /app-settings' });
});

router.get('/agency-profile', getAgencyProfile);
router.put('/agency-profile', updateAgencyProfile);
router.get('/app-settings', getAppSettings);
router.put('/app-settings', updateAppSettings);

export default router;
