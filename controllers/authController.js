const Agent = require('../models/Agent'); // Ajusta según tu modelo real

exports.sendOtp = (req, res) => {
  // Placeholder
  res.send('OTP enviado');
};

exports.verifyOtp = (req, res) => {
  // Placeholder
  res.send('OTP verificado');
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const agent = await Agent.findOne({ email });

    if (!agent) {
      return res.status(404).json({ message: 'Agente no encontrado' });
    }

    if (agent.password !== password) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        name: agent.name,
        email: agent.email,
        role: agent.role || 'agent'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
