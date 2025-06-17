
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const app = express();
const upload = multer();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/send-communication-email', upload.none(), async (req, res) => {
  const { recipientEmail, subject, message, senderEmail } = req.body;

  if (!recipientEmail) {
    return res.status(400).json({ error: 'Recipient email is required.' });
  }

  try {
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
      html: message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.response);
    res.status(200).json({ success: true, message: 'Correo enviado.' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
  const { recipientEmail, documentTitle } = req.body;
  const pdfBuffer = req.file?.buffer;

  if (!pdfBuffer || !recipientEmail) {
    return res.status(400).json({ error: 'Falta archivo PDF o destinatario.' });
  }

  try {
    const pdfBase64 = pdfBuffer.toString('base64');

    const response = await axios.post(
      'https://api.pdf.co/v1/pdf/sign',
      {
        url: '',
        async: false,
        name: documentTitle || 'documento.pdf',
        profiles: '{}',
        file: pdfBase64,
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
        ],
        recipient: {
          email: recipientEmail
        }
      },
      {
        headers: {
          'x-api-key': process.env.PDFCO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Respuesta de PDF.co:', response.data);
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error al enviar a PDF.co:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en el puerto ${PORT}`);
});
