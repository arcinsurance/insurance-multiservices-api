const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/send-communication-email', async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD, // App Password
      },
    });

    await transporter.sendMail({
      from: \`"Insurance Multiservices" <\${process.env.EMAIL_SENDER}>\`,
      to,
      subject,
      text,
    });

    res.status(200).json({ message: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ message: 'Error al enviar el correo' });
  }
});

module.exports = router;