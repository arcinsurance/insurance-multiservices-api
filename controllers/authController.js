
const Agent = require('../models/Agent');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const agent = await Agent.findOne({ email });
    if (!agent) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: agent._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token, agent });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.registerAgent = async (req, res) => {
  const { email, name, password } = req.body;

  try {
    const existing = await Agent.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'El agente ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAgent = new Agent({
      name,
      email,
      password: hashedPassword,
    });

    await newAgent.save();
    res.status(201).json({ message: 'Agente registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar al agente' });
  }
};
