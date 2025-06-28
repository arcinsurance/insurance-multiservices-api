const Cliente = require('../models/Cliente');

// Importar clientes en lote (ya lo tienes)
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

// 🚀 NUEVA FUNCIÓN: Crear cliente individual
exports.createClient = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, fecha_inicio, aseguradora } = req.body;

    // Validar campos requeridos
    if (!nombre || !apellido) {
      return res.status(400).json({ message: 'Nombre y apellido son obligatorios' });
    }

    const nuevoCliente = await Cliente.create({
      nombre,
      apellido,
      email,
      telefono,
      fecha_inicio,
      aseguradora
    });

    res.status(201).json(nuevoCliente);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el cliente', error: error.message });
  }
};
