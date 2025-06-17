
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const upload = multer();
app.use(cors());
app.use(express.json());

// Endpoint de prueba
app.get('/', (req, res) => res.send('API en funcionamiento'));

// Enviar correos
app.post('/api/send-communication-email', upload.any(), async (req, res) => {
  try {
    const { senderEmail, recipientEmail, subject, message } = req.body;
    const attachments = req.files?.map(file => ({
      filename: file.originalname,
      content: file.buffer,
    })) || [];

    if (!recipientEmail) {
      return res.status(400).json({ error: 'Falta destinatario' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: senderEmail || process.env.GMAIL_USER,
      to: recipientEmail,
      subject,
      text: message,
      attachments,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ error: 'Error interno al enviar correo' });
  }
});

// Enviar a PDF.co
app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
  try {
    const { recipientEmail, documentTitle } = req.body;
    const apiKey = process.env.PDFCO_API_KEY;

    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);
    formData.append('name', documentTitle);
    formData.append('async', 'false');
    formData.append('encrypt', 'false');
    formData.append('annotations', JSON.stringify([{
      text: 'Por favor firme aquí',
      x: 100,
      y: 150,
      pages: '1',
      type: 'signature',
      width: 150,
      height: 50,
      recipientName: recipientEmail,
      recipientEmail,
    }]));

    const response = await axios.post(
      'https://api.pdf.co/v1/pdf/edit/add',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'x-api-key': apiKey,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error al enviar a PDF.co:', error);
    res.status(500).json({ error: 'Error interno al procesar PDF.co' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en el puerto ${PORT}`);
});
