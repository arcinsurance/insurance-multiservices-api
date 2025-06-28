const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const auth = require('../middleware/auth');

router.post('/import', auth, clientController.importClients);

// 🚀 NUEVA RUTA: Crear cliente individual
router.post('/', auth, clientController.createClient);

// 🚀 RUTA DE PRUEBA: verificar conexión
router.get('/test', (req, res) => {
  res.json({ message: 'Ruta clientes funcionando' });
});

module.exports = router;
