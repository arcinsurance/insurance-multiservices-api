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
import policyRoutes from './routes/policies'; // ver nota de montaje más abajo
import documentRoutes from './routes/documents';
import messageRoutes from './routes/messages';
import signedDocumentsRoutes from './routes/signedDocuments';
import settingsRoutes from './routes/settingsRoutes';
import agencyLicensesRoutes from './routes/agencyLicenses';
import carriersRoutes from './routes/carriers';
import chatMessagesRoutes from './routes/chatMessages';
import chatRoutes from './routes/chat';
import usersRoutes from './routes/users';
import commissionRatesRoutes from './routes/commissionRates';
import settingsLogRoutes from './routes/settingsLog';
import leadRoutes from './routes/leadRoutes';
import agencyProfileRoutes from './routes/agencyProfileRoutes';

// 👇 NUEVO: import del seed
import { seedCarrierLines } from './utils/seedCarrierLines';

dotenv.config();

const app = express();

/* ───────────── Middlewares globales ───────────── */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

/* ───────────── CORS ───────────── */
const allowedOrigins = [
  'https://crm.insurancemultiservices.com', // producción
  'http://localhost:5173',                  // dev local
  'http://localhost:5174',                  // dev alterno
  'http://localhost:3000',                  // build local
  // agrega aquí tu dominio de frontend en Render si aplica:
  // 'https://tu-frontend.onrender.com',
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

/* ───────────── Healthcheck para Render ───────────── */
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

/* ───────────── Rutas API ───────────── */
app.get('/', (_req, res) => {
  res.json({ message: 'Insurance Multiservices API is running', status: 'OK' });
});

app.get('/api', (_req, res) => {
  res.json({ message: 'Insurance Multiservices API v1.0', status: 'OK' });
});

app.use('/api/clients', clientRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/change-password', changePasswordRoute);
app.use('/api/product-categories', productCategoryRoutes);

// ⬇⬇ ELIGE UNA OPCIÓN PARA policies ⬇⬇
// Opción A: si DENTRO de routes/policies.ts usas rutas como
// router.post('/clients/:clientId/policies', ...)
// router.get('/clients/:clientId/policies', ...)
// entonces monta el router en /api:
app.use('/api', policyRoutes);

// Opción B: si DENTRO de routes/policies.ts usas rutas “planas”:
// app.use('/api/policies', policyRoutes);

app.use('/api/documents', documentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/signed-documents', signedDocumentsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/document-templates', documentTemplatesRoutes);
app.use('/api/agency-licenses', agencyLicensesRoutes);
app.use('/api/carriers', carriersRoutes);
app.use('/api/chat-messages', chatMessagesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/commission-rates', commissionRatesRoutes);
app.use('/api/settings-log', settingsLogRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/agency-profile', agencyProfileRoutes);

/* ───────────── Endpoint de prueba ───────────── */
app.get('/api/messages/test', (_req, res) => {
  res.json({ message: 'Ruta mensajes activa' });
});

/* ───────────── Seed opcional en arranque ───────────── */
// 👇 NUEVO: corre el seed SOLO si la variable SEED_CARRIER_LINES está activada
async function runSeedIfEnabled() {
  try {
    const enabled = (process.env.SEED_CARRIER_LINES || '').toLowerCase();
    if (enabled === '1' || enabled === 'true' || enabled === 'yes') {
      console.log('🚜  Seeding carrier_lines (habilitado por SEED_CARRIER_LINES)...');
      await seedCarrierLines(process.env.CARRIERS_XLSX_PATH);
      console.log('✅  Seed carrier_lines completado.');
    } else {
      console.log('ℹ️  Seed de carrier_lines deshabilitado (SEED_CARRIER_LINES no está activo).');
    }
  } catch (err) {
    console.error('❌  Error ejecutando seedCarrierLines:', err);
  }
}

/* ───────────── Puerto ───────────── */
const PORT = Number(process.env.PORT || 10000);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  // 👇 NUEVO: lanzamos el seed en segundo plano
  void runSeedIfEnabled();
});
