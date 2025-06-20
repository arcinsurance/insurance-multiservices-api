const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Agent = require('../models/Agent'); // Asegúrate de que exista el modelo Agent y esté bien configurado

// Ruta: POST /api/register-agent
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verifica que todos los campos estén presentes
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Verifica si el agente ya existe
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(409).json({ message: 'El agente ya está registrado' });
    }

    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea y guarda el nuevo agente
    const newAgent = new Agent({
      name,
      email,
      password: hashedPassword,
      role: 'agent',
      active: true
    });

    await newAgent.save();

    res.status(201).json({ message: 'Agente registrado exitosamente' });
  } catch (error) {
    console.error('❌ Error registrando agente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
