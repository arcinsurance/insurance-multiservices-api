
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const fs = require('fs');
const FormData = require('form-data');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/send-communication-email', upload.array('attachments'), async (req, res) => {
  const { senderEmail, recipientEmail, subject, message } = req.body;
  const attachments = req.files.map(file => ({
    filename: file.originalname,
    content: file.buffer,
  }));

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: senderEmail,
      to: recipientEmail,
      subject,
      html: message,
      attachments,
    });

    console.log('Correo enviado:', info.response);
    res.status(200).json({ message: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ error: 'Error al enviar correo' });
  }
});

app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
  const { recipientEmail, documentTitle } = req.body;
  const fileBuffer = req.file?.buffer;

  if (!fileBuffer) {
    return res.status(400).json({ error: 'Archivo PDF no proporcionado' });
  }

  try {
    const base64Pdf = fileBuffer.toString('base64');

    const payload = {
      name: documentTitle,
      file: base64Pdf,
      async: false,
      annotations: [
        {
          x: 400,
          y: 100,
          text: "Firma aquí",
          type: "signature",
          pages: "1",
          recipientName: "Cliente",
          recipientEmail: recipientEmail,
          role: "signer"
        }
      ]
    };

    const response = await axios.post('https://api.pdf.co/v1/pdf/edit/add', payload, {
      headers: {
        'x-api-key': process.env.PDFCO_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('Respuesta PDF.co:', response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error al enviar a PDF.co:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al enviar a PDF.co', detail: error.response?.data || error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en el puerto ${PORT}`);
});
