// server.js - Archivo principal del servidor Express
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar dotenv
dotenv.config();

// Importar todas las rutas
import authRoutes from './src/routes/auth.js';
import clientRoutes from './src/routes/clients.js';
import agentRoutes from './src/routes/agents.js';
import productRoutes from './src/routes/products.js';
import carrierRoutes from './src/routes/carriers.js';
import settingsRoutes from './src/routes/settingsRoutes.js';
import documentRoutes from './src/routes/documents.js';
import signedDocumentRoutes from './src/routes/signedDocuments.js';
import documentTemplateRoutes from './src/routes/documentTemplates.js';
import messageRoutes from './src/routes/messages.js';
import chatMessageRoutes from './src/routes/chatMessages.js';
import commissionRateRoutes from './src/routes/commissionRates.js';
import agencyLicenseRoutes from './src/routes/agencyLicenses.js';
import agencyProfileRoutes from './src/routes/agencyProfileRoutes.js';
import productCategoryRoutes from './src/routes/productCategories.js';
import leadRoutes from './src/routes/leadRoutes.js';
import settingsLogRoutes from './src/routes/settingsLog.js';
import changePasswordRoutes from './src/routes/changePassword.js';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de CORS configurado para producción
const allowedOrigins = [
  'https://crm.insurancemultiservices.com',
  'https://www.crm.insurancemultiservices.com',
  'https://insurancemultiservices.com',
  'https://www.insurancemultiservices.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Ruta de salud básica
app.get('/', (req, res) => {
  res.json({
    message: 'Insurance Multiservices API - Funcionando ✅',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 🔥 REGISTRAR TODAS LAS RUTAS DE LA API 🔥
console.log('🔗 Registrando rutas de la API...');

// Rutas de autenticación
app.use('/api/auth', authRoutes);
console.log('✅ /api/auth registrado');

// Rutas de clientes
app.use('/api/clients', clientRoutes);
console.log('✅ /api/clients registrado');

// Rutas de agentes
app.use('/api/agents', agentRoutes);
console.log('✅ /api/agents registrado');

// Rutas de productos
app.use('/api/products', productRoutes);
console.log('✅ /api/products registrado');

// Rutas de carriers
app.use('/api/carriers', carrierRoutes);
console.log('✅ /api/carriers registrado');

// Rutas de configuración
app.use('/api/settings', settingsRoutes);
console.log('✅ /api/settings registrado');

// Rutas de documentos
app.use('/api/documents', documentRoutes);
console.log('✅ /api/documents registrado');

// Rutas de documentos firmados
app.use('/api/signed-documents', signedDocumentRoutes);
console.log('✅ /api/signed-documents registrado');

// Rutas de plantillas de documentos
app.use('/api/document-templates', documentTemplateRoutes);
console.log('✅ /api/document-templates registrado');

// Rutas de mensajes
app.use('/api/messages', messageRoutes);
console.log('✅ /api/messages registrado');

// Rutas de chat
app.use('/api/chat-messages', chatMessageRoutes);
console.log('✅ /api/chat-messages registrado');

// Rutas de comisiones
app.use('/api/commission-rates', commissionRateRoutes);
console.log('✅ /api/commission-rates registrado');

// Rutas de licencias de agencia
app.use('/api/agency-licenses', agencyLicenseRoutes);
console.log('✅ /api/agency-licenses registrado');

// Rutas de perfil de agencia
app.use('/api/agency-profile', agencyProfileRoutes);
console.log('✅ /api/agency-profile registrado');

// Rutas de categorías de productos
app.use('/api/product-categories', productCategoryRoutes);
console.log('✅ /api/product-categories registrado');

// Rutas de leads
app.use('/api/leads', leadRoutes);
console.log('✅ /api/leads registrado');

// Rutas de logs de configuración
app.use('/api/settings-log', settingsLogRoutes);
console.log('✅ /api/settings-log registrado');

// Rutas de cambio de contraseña
app.use('/api', changePasswordRoutes);
console.log('✅ /api/change-password registrado');

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'POST /api/auth/request-otp',
      'POST /api/auth/verify-otp',
      'GET /api/auth/me',
      'GET /api/clients',
      'POST /api/clients',
      'GET /api/products',
      'GET /api/carriers',
      // ... más rutas disponibles
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 ===============================================');
  console.log(`🚀 Insurance Multiservices API Server`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Database: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log('🚀 ===============================================');
  console.log('🔗 Rutas API disponibles:');
  console.log('   - GET / (health check)');
  console.log('   - POST /api/auth/request-otp');
  console.log('   - POST /api/auth/verify-otp');
  console.log('   - GET /api/auth/me');
  console.log('   - GET /api/clients');
  console.log('   - POST /api/clients');
  console.log('   - GET /api/products');
  console.log('   - GET /api/carriers');
  console.log('   - GET /api/agents');
  console.log('   - Y muchas más...');
  console.log('🚀 ===============================================');
});

export default app;
