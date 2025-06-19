import express from 'express';
import multer from 'multer';
import { uploadTemplate, listTemplates } from '../controllers/templatesController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('template'), uploadTemplate);
router.get('/', listTemplates);

export default router;