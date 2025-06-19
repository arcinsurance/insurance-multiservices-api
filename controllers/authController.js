
const nodemailer = require('nodemailer');
require('dotenv').config();

const sendOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Insurance Multiservices" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Código de verificación',
      text: `Tu código de verificación es: ${otp}`,
    });

    res.status(200).json({ message: 'OTP enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar OTP:', error);
    res.status(500).json({ message: 'Error al enviar OTP' });
  }
};

const verifyOtp = (req, res) => {
  // Esta función debe implementarse según tu lógica de verificación
  res.status(200).json({ message: 'OTP verificado (placeholder)' });
};

module.exports = { sendOtp, verifyOtp };
