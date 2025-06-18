
import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import sendCommunicationEmail from './routes/sendCommunicationEmail.js';
import sendSignatureRequest from './routes/sendSignatureRequest.js';
import importClients from './routes/importClients.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer();

app.post('/api/send-communication-email', sendCommunicationEmail);
app.post('/api/send-signature-request', upload.single('pdf'), sendSignatureRequest);
app.post('/api/import-clients', upload.single('csv'), importClients);

app.listen(port, () => {
  console.log(`✅ Backend server running on port ${port}`);
});
