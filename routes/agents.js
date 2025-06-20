const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Agent = require('../models/agent');

// Registro de agente
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const existing = await Agent.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Este agente ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAgent = new Agent({
      name,
      email,
      password: hashedPassword,
    });

    await newAgent.save();

    res.status(201).json({ message: 'Agente registrado correctamente.' });
  } catch (err) {
    console.error('Error registrando agente:', err);
    res.status(500).json({ message: 'Error registrando agente', error: err.message });
  }
});

// Login de agente
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const agent = await Agent.findOne({ email });
    if (!agent) return res.status(404).json({ message: 'Agente no encontrado' });

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: agent._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ message: 'Login exitoso', token, agent });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error en login', error: err.message });
  }
});

module.exports = router;
