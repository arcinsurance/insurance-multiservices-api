import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import clientRoutes from './routes/clients';
import agentRoutes from './routes/agents';
import authRoutes from './routes/auth';
import productCategoryRoutes from './routes/productCategories'; // ➜ Rutas de categorías
import changePasswordRoute from './routes/changePassword'; // ✅ NUEVA ruta para cambiar contraseña
import policyRoutes from './routes/policies'; // ✅ Ruta para pólizas agregada

import { db } from './config/db';

dotenv.config();

const app = express();

/* ───────────── CORS ───────────── */
const allowedOrigins = [
  'https://crm.insurancemultiservices.com', // producción
  'http://localhost:5173',                  // desarrollo local
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Manejo explícito de preflight (OPTIONS)
app.options('*', cors());

/* ───────────── Middlewares ───────────── */
app.use(express.json());

/* ───────────── Rutas API ───────────── */
app.use('/api/clients', clientRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', changePasswordRoute);
app.use('/api/product-categories', productCategoryRoutes);
app.use('/api/policies', policyRoutes); // ✅ Nueva ruta registrada aquí

/* ───────────── Puerto ───────────── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
