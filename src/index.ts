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
import signedDocumentsRoutes from './routes/signedDocuments';
import settingsRoutes from './routes/settingsRoutes';
import agencyLicensesRoutes from './routes/agencyLicenses';
import carriersRoutes from './routes/carriers';
import chatMessagesRoutes from './routes/chatMessages';
import commissionRatesRoutes from './routes/commissionRates';
import settingsLogRoutes from './routes/settingsLog';

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
app.use('/api/change-password', changePasswordRoute);
app.use('/api/product-categories', productCategoryRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/signed-documents', signedDocumentsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/document-templates', documentTemplatesRoutes);
app.use('/api/agency-licenses', agencyLicensesRoutes);
app.use('/api/carriers', carriersRoutes);
app.use('/api/chat-messages', chatMessagesRoutes);
app.use('/api/commission-rates', commissionRatesRoutes);
app.use('/api/settings-log', settingsLogRoutes);

/* ───────────── Endpoint de prueba ───────────── */
app.get('/api/messages/test', (_req, res) => {
  res.json({ message: 'Ruta mensajes activa' });
});

/* ───────────── Puerto ───────────── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
