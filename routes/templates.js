
const express = require('express');
const router = express.Router();
const Template = require('../models/Template');

// Obtener todas las plantillas
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las plantillas', error: error.message });
  }
});

// Crear una nueva plantilla
router.post('/', async (req, res) => {
  try {
    const { name, content } = req.body;
    const newTemplate = new Template({ name, content });
    await newTemplate.save();
    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear plantilla', error: error.message });
  }
});

// Actualizar plantilla
router.put('/:id', async (req, res) => {
  try {
    const { name, content } = req.body;
    const updated = await Template.findByIdAndUpdate(
      req.params.id,
      { name, content },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar plantilla', error: error.message });
  }
});

// Eliminar plantilla
router.delete('/:id', async (req, res) => {
  try {
    await Template.findByIdAndDelete(req.params.id);
    res.json({ message: 'Plantilla eliminada' });
  } catch (error) {
    res.status(400).json({ message: 'Error al eliminar plantilla', error: error.message });
  }
});

module.exports = router;
