const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const sendEmailRoute = require('./routes/sendcommunicationemail');
const sendSignatureRoute = require('./routes/sendsignaturerequest');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch((error) => console.error('❌ Error en MongoDB:', error));

// Rutas
app.use('/api', sendEmailRoute);
app.use('/api', sendSignatureRoute);

// Ruta principal
app.get('/', (req, res) => {
  res.send('Backend de Insurance Multiservices funcionando');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend escuchando en puerto ${PORT}`);
});