const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// CORS
app.use(cors({
  origin: [
    'https://crm.insurancemultiservices.com',
    'http://localhost:5173'
  ],
  credentials: true
}));

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas principales
app.use('/api/send-email', require('./routes/sendcommunicationemail'));
app.use('/api/send-signature', require('./routes/sendSignatureRequest'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/import-clients', require('./routes/importClients'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/register-agent', require('./routes/register-agent'));

// ✅ Ruta para descargar backup
app.use('/api/backup', require('./routes/backup')); // ✅ Esta línea permite el acceso a /api/backup/download

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado a MongoDB');
  app.listen(PORT, () => console.log(`🚀 Servidor backend escuchando en puerto ${PORT}`));
})
.catch((error) => {
  console.error('❌ Error en MongoDB:', error);
});
