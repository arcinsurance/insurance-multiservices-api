
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const axios = require('axios');
const cors = require('cors');
const app = express();
const upload = multer();
app.use(cors());
app.use(express.json());

app.post('/api/send-communication-email', upload.any(), async (req, res) => {
  const formData = req.body;
  const files = req.files;
  const recipientEmail = formData.recipientEmail;
  const subject = formData.subject || 'Mensaje desde Insurance Multiservices';
  const message = formData.message || '';

  if (!recipientEmail) return res.status(400).json({ error: 'Falta recipientEmail' });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    }
  });

  const attachments = files.map(file => ({
    filename: file.originalname,
    content: file.buffer
  }));

  try {
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: recipientEmail,
      subject,
      html: message,
      attachments
    });
    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    res.status(500).json({ error: 'Error enviando email', details: err.toString() });
  }
});

app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
  const file = req.file;
  const { recipientEmail, documentTitle } = req.body;
  if (!file || !recipientEmail || !documentTitle) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const pdfcoRes = await axios.post('https://api.pdf.co/v1/pdf/sign/add', {
      url: 'data:application/pdf;base64,' + file.buffer.toString('base64'),
      name: documentTitle,
      async: false,
      annotations: [
        {
          text: "Por favor firme aquí",
          x: 50,
          y: 50,
          pages: "1",
          type: "signature",
          width: 200,
          height: 50
        }
      ]
    }, {
      headers: {
        'x-api-key': process.env.PDFCO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    res.json(pdfcoRes.data);
  } catch (err) {
    res.status(500).json({ error: 'Error enviando a PDF.co', details: err.response?.data || err.toString() });
  }
});

app.listen(10000, () => console.log("🚀 Backend escuchando en el puerto 10000"));
