import { Router } from 'express';
import { getSettingsLog } from '../controllers/settingsLogController';

const router = Router();

router.get('/', getSettingsLog);

export default router;
