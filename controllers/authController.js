
const users = require('../data/users'); // Suponiendo que tienes una lista de usuarios
const { sendEmailWithOtp, generateOtp, otpStore } = require('../utils/otpUtils');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Email o contraseña incorrectos' });
  }

  const otp = generateOtp();
  otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

  await sendEmailWithOtp(email, otp);
  res.json({ message: 'OTP enviado al correo', otpPending: true });
};

exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) return res.status(400).json({ message: 'No se solicitó OTP para este email' });
  if (Date.now() > record.expiresAt) return res.status(400).json({ message: 'El código ha expirado' });
  if (record.otp !== otp) return res.status(400).json({ message: 'Código incorrecto' });

  delete otpStore[email];
  res.json({ message: 'Autenticación exitosa' });
};
