const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const app = express();
app.use(cors());
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/send-communication-email', upload.array('attachments'), async (req, res) => {
  try {
    const { senderEmail, recipientEmail, subject, body } = req.body;

    if (!recipientEmail || !senderEmail) {
      return res.status(400).json({ error: 'Faltan campos requeridos: senderEmail o recipientEmail' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const attachments = (req.files || []).map(file => ({
      filename: file.originalname,
      content: file.buffer,
    }));

    const mailOptions = {
      from: senderEmail,
      to: recipientEmail,
      subject: subject || '(Sin asunto)',
      text: body || '',
      attachments: attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', result.response);

    res.json({ message: 'Correo enviado correctamente.' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ error: 'Error al enviar el correo.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('Servidor activo en puerto', PORT);
});