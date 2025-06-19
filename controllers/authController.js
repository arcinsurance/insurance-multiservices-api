const Agent = require('../models/Agent');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const agent = await Agent.findOne({ email });

    if (!agent || agent.password !== password) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    res.status(200).json({ message: 'Inicio de sesión exitoso', agent });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
};
