const express = require('express');
const cors = require('cors');
const sequelize = require('./models/index');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Simulación de usuario autenticado (solo para pruebas, comentar en producción)
app.use((req, res, next) => {
  req.user = { role: 'admin' };
  next();
});

// Importa las rutas de clientes (en español)
const clienteRoutes = require('./routes/clienteRoutes');
app.use('/api/clientes', clienteRoutes);

const PORT = process.env.PORT || 10000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error conectando a MySQL:', err);
});
