const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: String,
  telefono: String,
  fecha_inicio: String,
  aseguradora: String,
}, { timestamps: true });

module.exports = mongoose.model('Cliente', clienteSchema);