import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import sendSignatureRequest from './routes/sendSignatureRequest.js';
import importClients from './routes/importClients.js'; // 👈 AÑADIDO

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer();
app.post('/api/send-signature-request', upload.single('pdf'), sendSignatureRequest);

// 👇 REGISTRA EL NUEVO ENDPOINT PARA IMPORTACIÓN CSV
app.use('/api', importClients);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
