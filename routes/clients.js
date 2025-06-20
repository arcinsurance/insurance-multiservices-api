const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

// GET - Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los clientes', error: error.message });
  }
});

// POST - Crear un nuevo cliente
router.post('/', async (req, res) => {
  try {
    const newClient = new Client(req.body);
    await newClient.save();
    res.status(201).json({ message: 'Cliente creado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear cliente', error: error.message });
  }
});

// PUT - Actualizar cliente por ID
router.put('/:id', async (req, res) => {
  try {
    const updated = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json({ message: 'Cliente actualizado', client: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar cliente', error: error.message });
  }
});

// DELETE - Eliminar cliente por ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Client.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar cliente', error: error.message });
  }
});

module.exports = router;
