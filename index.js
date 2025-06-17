const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const upload = multer();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enviar mensajes normales por Gmail
app.post('/api/send-communication-email', upload.any(), async (req, res) => {
  try {
    const recipientEmail = req.body.recipientEmail;
    const subject = req.body.subject || 'Mensaje de la agencia';
    const message = req.body.message || '';
    const senderEmail = req.body.senderEmail || process.env.GMAIL_USER;

    if (!recipientEmail) {
      return res.status(400).json({ error: 'Falta recipientEmail' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: senderEmail,
      to: recipientEmail,
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Correo enviado correctamente.' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ error: error.message || 'Error al enviar correo' });
  }
});

// Enviar documentos a firma vía PDF.co
app.post('/api/send-signature-request', upload.any(), async (req, res) => {
  try {
    const recipientEmail = req.body.recipientEmail;
    const documentTitle = req.body.documentTitle || 'Documento';
    const file = req.files?.find(f => f.fieldname === 'pdf');

    if (!recipientEmail || !file) {
      return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }

    const pdfcoResponse = await axios.post(
      'https://api.pdf.co/v1/pdf/sign/add',
      {
        url: '',
        async: false,
        name: documentTitle,
        profiles: '{}',
        annotations: [
          {
            x: 400,
            y: 100,
            text: 'Firma aquí',
            type: 'signature',
            pages: '1',
            recipientName: 'Cliente',
            recipientEmail: recipientEmail,
            role: 'signer'
          }
        ]
      },
      {
        headers: {
          'x-api-key': process.env.PDFCO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({ message: 'Documento enviado a firma.', response: pdfcoResponse.data });
  } catch (error) {
    console.error('Error al enviar a firma:', error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en el puerto ${PORT}`);
});
