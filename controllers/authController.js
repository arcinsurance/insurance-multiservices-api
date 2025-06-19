const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  await User.findOneAndUpdate({ email }, {
    otpCode: otp,
    otpExpiresAt: new Date(expiresAt)
  });

  await sendEmail(email, 'Tu código de verificación', `Tu código es: ${otp}`);
  res.status(200).json({ message: 'Código enviado' });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otpCode !== otp || Date.now() > user.otpExpiresAt) {
    return res.status(400).json({ message: 'Código inválido o expirado' });
  }

  user.otpCode = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  const sixMonths = 1000 * 60 * 60 * 24 * 30 * 6;
  const mustChangePassword = !user.lastPasswordChange || (Date.now() - user.lastPasswordChange.getTime()) > sixMonths;

  res.status(200).json({ message: 'Verificado', mustChangePassword });
};
