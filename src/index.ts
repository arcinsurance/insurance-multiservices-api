import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientRoutes from './routes/clients';
import { db } from './config/db';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/clients', clientRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});