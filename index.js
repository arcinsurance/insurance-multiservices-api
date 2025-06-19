
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({
  origin: [
    'https://crm.insurancemultiservices.com',
    'http://localhost:5173'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/send-email', require('./routes/sendcommunicationemail'));
app.use('/api/send-signature', require('./routes/sendsignaturerequest'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/import-clients', require('./routes/importClients'));

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
