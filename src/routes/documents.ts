// src/routes/documents.ts
import express from 'express';
import { sendDocumentController } from '../controllers/documentController';

const router = express.Router();

router.post('/send', sendDocumentController);

export default router;
