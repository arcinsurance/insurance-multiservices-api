
const express = require('express');
const router = express.Router();

// Mock de templates para pruebas
router.get('/', async (req, res) => {
  try {
    const templates = [
      { id: 1, name: 'Bienvenida', content: 'Hola, bienvenido a nuestro sistema.' },
      { id: 2, name: 'Renovación', content: 'Recuerda renovar tu póliza pronto.' }
    ];
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los templates', error: error.message });
  }
});

module.exports = router;
