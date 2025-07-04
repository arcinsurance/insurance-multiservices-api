import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import clientRoutes from './routes/clients';
import agentRoutes from './routes/agents';
import authRoutes from './routes/auth';
import productCategoryRoutes from './routes/productCategories'; // ✅ NUEVA IMPORTACIÓN

import { db } from './config/db';

dotenv.config();

const app = express();

// ✅ CONFIGURAR CORS CORRECTAMENTE
const allowedOrigins = [
  'https://crm.insurancemultiservices.com',
  'http://localhost:5173', // opcional para desarrollo
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());

app.use(express.json());

// ✅ Rutas existentes
app.use('/api/clients', clientRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/auth', authRoutes);

// ✅ Nueva ruta para product categories
app.use('/api/product-categories', productCategoryRoutes); // ✅ NUEVA RUTA

// ✅ Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
