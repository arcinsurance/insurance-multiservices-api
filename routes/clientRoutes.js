const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const auth = require('../middleware/auth');

// Aplica autenticación a todas las rutas de este router
router.use(auth);

// Importar clientes masivamente (por archivo)
router.post('/import', clientController.importClients);

// Crear un cliente individual
router.post('/', clientController.createClient);

// Listar todos los clientes (puedes agregar paginación en el controlador)
router.get('/', clientController.getAllClients);

// Obtener un cliente específico por ID
router.get('/:id', clientController.getClientById);

// Actualizar un cliente existente
router.put('/:id', clientController.updateClient);

// Eliminar un cliente
router.delete('/:id', clientController.deleteClient);

// Ruta de prueba (opcional, la puedes quitar después)
router.get('/test', (req, res) => {
  res.json({ message: 'Ruta clientes funcionando' });
});

module.exports = router;
