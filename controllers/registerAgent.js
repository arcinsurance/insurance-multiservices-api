const Agent = require('../models/Agent');
const bcrypt = require('bcrypt');

const registerAgent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const existing = await Agent.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'El agente ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAgent = new Agent({
      name,
      email,
      password: hashedPassword
    });

    await newAgent.save();
    res.status(201).json({ message: 'Agente registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar agente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = registerAgent;
