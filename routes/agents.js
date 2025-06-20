const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');

router.get('/', async (req, res) => {
  try {
    const agents = await Agent.find().select('-password'); // no mostrar passwords
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los agentes', error: error.message });
  }
});

module.exports = router;
