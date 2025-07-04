import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import clientRoutes from './routes/clients';
import agentRoutes from './routes/agents';
import authRoutes from './routes/auth';
import { db } from './config/db';

dotenv.config();

const app = express();

// ✅ CONFIGURAR CORS CORRECTAMENTE
const allowedOrigins = [
  'https://crm.insurancemultiservices.com',
  'http://localhost:5173' // opcional para desarrollo
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Opcional pero recomendado: Manejar preflight explícitamente
app.options('*', cors());

// ✅ Middleware antes de las rutas
app.use(express.json());

// ✅ Tus rutas
app.use('/api/clients', clientRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/auth', authRoutes);

// ✅ Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
