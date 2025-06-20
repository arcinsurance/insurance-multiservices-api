const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const bcrypt = require('bcrypt');

// GET - Listar agentes con filtros opcionales por nombre o email
router.get('/', async (req, res) => {
  try {
    const { name, email } = req.query;
    const filters = {};
    if (name) filters.name = new RegExp(name, 'i');
    if (email) filters.email = new RegExp(email, 'i');

    const agents = await Agent.find(filters).select('-password');
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los agentes', error: error.message });
  }
});

// POST - Crear agente
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await Agent.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'El agente ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAgent = new Agent({
      name,
      email,
      password: hashedPassword,
      hasChangedInitialPassword: false
    });

    await newAgent.save();
    res.status(201).json({ message: 'Agente creado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear agente', error: error.message });
  }
});

// PUT - Actualizar agente por ID
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updated = await Agent.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Agente no encontrado' });

    res.json({ message: 'Agente actualizado', agent: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar agente', error: error.message });
  }
});

// DELETE - Eliminar agente por ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Agent.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Agente no encontrado' });
    res.json({ message: 'Agente eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar agente', error: error.message });
  }
});

module.exports = router;
