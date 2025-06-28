const Cliente = require('../models/Cliente');

exports.importClients = async (req, res) => {
  try {
    const clientes = req.body;
    if (!Array.isArray(clientes)) {
      return res.status(400).json({ message: 'Formato inválido' });
    }

    let creados = 0, actualizados = 0, ignorados = 0;
    let errores = [];

    for (const c of clientes) {
      if (!c.nombre || !c.apellido) {
        ignorados++;
        errores.push({ ...c, motivo: 'Faltan campos obligatorios' });
        continue;
      }

      // Busca por nombre y apellido
      let existente = await Cliente.findOne({ where: { nombre: c.nombre, apellido: c.apellido } });

      if (existente) {
        existente.email = c.email || existente.email;
        existente.telefono = c.telefono || existente.telefono;
        existente.fecha_inicio = c.fecha_inicio || existente.fecha_inicio;
        existente.aseguradora = c.aseguradora || existente.aseguradora;
        await existente.save();
        actualizados++;
      } else {
        await Cliente.create({
          nombre: c.nombre,
          apellido: c.apellido,
          email: c.email,
          telefono: c.telefono,
          fecha_inicio: c.fecha_inicio,
          aseguradora: c.aseguradora
        });
        creados++;
      }
    }

    res.json({ creados, actualizados, ignorados, errores });
  } catch (error) {
    res.status(500).json({ message: 'Error en la importación', error: error.message });
  }
};