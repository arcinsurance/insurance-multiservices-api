require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// Endpoint to send an email
app.post('/api/send-communication-email', upload.none(), async (req, res) => {
  try {
    const { senderEmail, recipientEmail, subject, message } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      from: senderEmail || process.env.GMAIL_USER,
      to: recipientEmail,
      subject: subject || 'Mensaje desde Insurance Multiservices',
      text: message || 'Este es un mensaje de prueba.'
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.response);
    res.json({ success: true, message: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to send a document for signature using PDF.co
app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
  try {
    const { recipientEmail, documentTitle } = req.body;
    const filePath = req.file.path;
    const fileData = fs.readFileSync(filePath).toString('base64');

    const options = {
      method: 'POST',
      url: 'https://api.pdf.co/v1/pdf/edit/add',
      headers: {
        'x-api-key': process.env.PDFCO_API_KEY,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        name: documentTitle || 'Documento para firma',
        async: false,
        url: 'data:application/pdf;base64,' + fileData,
        profiles: 'pdf-signature-request',
        annotations: [
          {
            "x": 50,
            "y": 50,
            "text": "Firma aquí",
            "pages": "1",
            "type": "signature",
            "recipientName": recipientEmail,
            "recipientEmail": recipientEmail
          }
        ]
      })
    };

    const response = await axios.request(options);
    fs.unlinkSync(filePath); // Clean up the uploaded file

    if (response.data.error) {
      console.error('Error al enviar a PDF.co:', response.data);
      return res.status(500).json({ error: response.data.message });
    }

    res.json({ success: true, result: response.data });
  } catch (error) {
    console.error('Error general al enviar a PDF.co:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en el puerto ${PORT}`);
});