import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientRoutes from './routes/clients';
import agentRoutes from './routes/agents';
import authRoutes from './routes/auth';
import { db } from './config/db';

dotenv.config(); // ✅ Siempre al inicio

const app = express(); // ✅ Define express app

// ✅ CONFIGURAR CORS CORRECTAMENTE
app.use(cors({
  origin: 'https://crm.insurancemultiservices.com',
  credentials: true,
}));

app.use(express.json());

// ✅ Rutas API
app.use('/api/clients', clientRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
