import express from 'express';
import { sendTestEmail } from '../controllers/testEmailController';

const router = express.Router();

router.get('/send', sendTestEmail);

export default router;
