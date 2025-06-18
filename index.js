
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const nodemailer = require('nodemailer');
const FormData = require('form-data');
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());
app.use(express.json());

app.post('/api/send-communication-email', upload.array('attachments'), async (req, res) => {
  const { senderEmail, recipientEmail, subject, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  const mailOptions = {
    from: senderEmail,
    to: recipientEmail,
    subject,
    text: message,
    attachments: req.files?.map(file => ({
      filename: file.originalname,
      content: file.buffer
    }))
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Correo enviado correctamente');
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).send('Error al enviar correo');
  }
});

app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
  try {
    const { recipientEmail, documentTitle } = req.body;
    const pdfBuffer = req.file.buffer;

    const formData = new FormData();
    formData.append('file', pdfBuffer, {
      filename: 'document.pdf',
      contentType: 'application/pdf'
    });
    formData.append('name', documentTitle);
    formData.append('annotations', JSON.stringify([
      {
        x: 400,
        y: 100,
        text: 'Firma aquí',
        type: 'signature',
        pages: '1',
        recipientname: 'Cliente',
        recipientemail: recipientEmail,
        role: 'signer'
      }
    ]));

    const response = await axios.post('https://api.pdf.co/v1/pdf/sign/add', formData, {
      headers: {
        ...formData.getHeaders(),
        'x-api-key': process.env.PDFCO_API_KEY
      }
    });

    res.status(200).json({ message: 'Solicitud de firma enviada correctamente', data: response.data });
  } catch (error) {
    console.error('Error enviando a PDF.co:', error.message || error);
    res.status(500).send(`Error enviando a PDF.co: ${error.message || error}`);
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
