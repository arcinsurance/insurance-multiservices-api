// src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import documentTemplatesRoutes from './routes/documentTemplates';

import clientRoutes from './routes/clients';
import agentRoutes from './routes/agents';
import authRoutes from './routes/auth';
import changePasswordRoute from './routes/changePassword';
import productCategoryRoutes from './routes/productCategories';
import policyRoutes from './routes/policies';
import documentRoutes from './routes/documents';
import messageRoutes from './routes/messages';
import signedDocumentsRoutes from './routes/signedDocuments';  // ✅ Envío y firma de documentos
import settingsRoutes from './routes/settingsRoutes';

import { db } from './config/db';

dotenv.config();

const app = express();

/* ───────────── Middlewares globales ───────────── */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

/* ───────────── CORS ───────────── */
const allowedOrigins = [
  'https://crm.insurancemultiservices.com', // producción
  'http://localhost:5173',                  // desarrollo local
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

/* ───────────── Rutas API ───────────── */
app.use('/api/clients', clientRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', changePasswordRoute);
app.use('/api/product-categories', productCategoryRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/signed-documents', signedDocumentsRoutes); // ✅ Ruta para firma de documentos
app.use('/api/settings', settingsRoutes);
app.use('/api/document-templates', documentTemplatesRoutes);


/* ───────────── Puerto ───────────── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
