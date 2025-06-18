import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sendCommunicationEmail from './routes/sendCommunicationEmail.js';

dotenv.config(); // Cargar variables de entorno

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use('/api', sendCommunicationEmail); // RUTA ACTIVADA AQUÍ

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
