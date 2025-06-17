
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

dotenv.config();

const app = express();
const upload = multer();
const PORT = process.env.PORT || 10000;

// Configuración de CORS
const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/send-communication-email', upload.any(), async (req, res) => {
  const { senderEmail, recipientEmail, subject, message } = req.body;
  const attachments = (req.files || []).map(file => ({
    filename: file.originalname,
    content: file.buffer,
  }));

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: senderEmail || process.env.GMAIL_USER,
    to: recipientEmail,
    subject,
    text: message,
    attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Correo enviado correctamente.' });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
  const { recipientEmail, documentTitle } = req.body;
  const pdfBuffer = req.file?.buffer;

  if (!pdfBuffer || !recipientEmail || !documentTitle) {
    return res.status(400).json({ error: true, message: 'Faltan datos requeridos.' });
  }

  const formData = new FormData();
  formData.append('url', '');
  formData.append('name', documentTitle);
  formData.append('async', 'false');
  formData.append('encrypt', 'false');
  formData.append('profiles', 'signature');
  formData.append('file', pdfBuffer, { filename: `${documentTitle}.pdf` });
  formData.append('annotations', JSON.stringify([{
    fieldName: 'signature',
    type: 'signature',
    x: 50, y: 600, width: 200, height: 40,
    page: 0,
    recipientName: 'Cliente',
    recipientEmail: recipientEmail,
  }]));

  try {
    const response = await axios.post('https://api.pdf.co/v1/pdf/edit/add', formData, {
      headers: {
        'x-api-key': process.env.PDFCO_API_KEY,
        ...formData.getHeaders(),
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error al enviar a PDF.co:", error.message);
    res.status(500).json({ error: true, message: 'Error enviando a PDF.co', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en el puerto ${PORT}`);
});
