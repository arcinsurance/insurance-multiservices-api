const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Simulación de usuario autenticado (solo para pruebas, comentar en producción)
app.use((req, res, next) => {
  req.user = { role: 'admin' }; // Cambiar según autenticación real
  next();
});

// Rutas de clientes
const clientRoutes = require('./routes/clientRoutes');
app.use('/api/clients', clientRoutes);

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crm';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
  })
  .catch(err => console.error('Error conectando a MongoDB:', err));