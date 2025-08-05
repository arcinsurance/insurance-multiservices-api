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
  res.json({ message: 'Settings API is running. Use /profile, /app, /agency-profile or /app-settings' });
});


// ---- Perfiles de agencia ----
router.get('/agency-profile', getAgencyProfile);
router.put('/agency-profile', updateAgencyProfile);

// ---- App settings ----
router.get('/app-settings', getAppSettings);
router.put('/app-settings', updateAppSettings);

// ---- Alias para frontend ----
// GET /settings/profile -> get agency profile
router.get('/profile', getAgencyProfile);
// PUT /settings/profile -> update agency profile
router.put('/profile', updateAgencyProfile);
// GET /settings/app -> get app settings
router.get('/app', getAppSettings);
// PUT /settings/app -> update app settings
router.put('/app', updateAppSettings);
// GET /settings/log -> get settings log
router.get('/log', getSettingsLog);

export default router;
