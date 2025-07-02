const Cliente = require('../models/Cliente');

// Importar clientes en lote (tu código actual, está perfecto)
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

// Crear cliente individual (tu función, pero mejorada con validación de email único)
exports.createClient = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, fecha_inicio, aseguradora } = req.body;

    if (!nombre || !apellido) {
      return res.status(400).json({ message: 'Nombre y apellido son obligatorios' });
    }

    // Validar email único si se envía email
    if (email) {
      const existe = await Cliente.findOne({ where: { email } });
      if (existe) {
        return res.status(400).json({ message: 'El correo ya está registrado.' });
      }
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

// Listar todos los clientes
exports.getAllClients = async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo clientes.', error: error.message });
  }
};

// Obtener un cliente específico por ID
exports.getClientById = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo cliente.', error: error.message });
  }
};

// Actualizar un cliente existente
exports.updateClient = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, fecha_inicio, aseguradora } = req.body;
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }

    // Validar email único si cambia
    if (email && email !== cliente.email) {
      const existe = await Cliente.findOne({ where: { email } });
      if (existe) {
        return res.status(400).json({ message: 'El correo ya está registrado en otro cliente.' });
      }
    }

    await cliente.update({ nombre, apellido, email, telefono, fecha_inicio, aseguradora });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando cliente.', error: error.message });
  }
};

// Eliminar un cliente
exports.deleteClient = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }
    await cliente.destroy();
    res.json({ message: 'Cliente eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando cliente.', error: error.message });
  }
};
