import express from 'express';
import {
  getAgencyProfile,
  updateAgencyProfile,
  
  getAppSettings,
  updateAppSettings,
  
} from '../controllers/settingsController';
import { getSettingsLog } from '../controllers/settingsLogController';

const router = express.Router();

// Ruta base para /api/settings
router.get('/', (_req, res) => {
  res.json({ message: 'Settings API is running. Use /agency-profile or /app-settings' });
});

router.get('/agency-profile', getAgencyProfile);
router.put('/agency-profile', updateAgencyProfile);
router.get('/app-settings', getAppSettings);
router.put('/app-settings', updateAppSettings);
// Rutas alias para frontend
router.get('/profile', getAgencyProfile);
router.put('/profile', updateAgencyProfile);
router.get('/app', getAppSettings);
router.put('/app', updateAppSettings);
router.get('/log', getSettingsLog);


export default router;
