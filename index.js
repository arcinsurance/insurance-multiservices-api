
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

app.use('/api', sendCommunicationEmail);
app.use('/api', sendSignatureRequest);
app.use('/api', importClients);

app.listen(port, () => {
  console.log(`✅ Backend running on port ${port}`);
});
