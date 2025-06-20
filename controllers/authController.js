const Agent = require('../models/Agent');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// ✅ LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('🔍 Intentando login para:', email);

    const agent = await Agent.findOne({ email });

    if (!agent) {
      console.log('⚠️ Agente no encontrado:', email);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      console.log('⚠️ Contraseña incorrecta para:', email);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: agent._id }, process.env.JWT_SECRET || 'defaultsecret', {
      expiresIn: '1d',
    });

    console.log('✅ Login exitoso:', email);

    res.status(200).json({
      message: 'Login exitoso',
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        hasChangedInitialPassword: agent.hasChangedInitialPassword
      },
      token
    });

  } catch (error) {
    console.error('❌ Error en login:', error.message);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// ✅ REGISTRO DE AGENTE
exports.registerAgent = async (req, res) => {
  const { email, name, password } = req.body;

  try {
    console.log('🧪 Registrando nuevo agente:', email);

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
    console.log('✅ Agente registrado correctamente:', email);

    res.status(201).json({ message: 'Agente registrado exitosamente' });

  } catch (error) {
    console.error('❌ Error al registrar agente:', error.message);
    res.status(500).json({ message: 'Error al registrar al agente', error: error.message });
  }
};
