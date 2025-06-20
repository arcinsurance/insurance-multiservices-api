const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los clientes', error: error.message });
  }
});

module.exports = router;
