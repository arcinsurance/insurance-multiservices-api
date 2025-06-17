
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const axios = require('axios');
const fs = require('fs');
const app = express();
const upload = multer();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/send-communication-email', upload.any(), async (req, res) => {
  try {
    const { senderEmail, recipientEmail, subject, message } = req.body;
    const attachments = req.files?.map(file => ({
      filename: file.originalname,
      content: file.buffer,
    })) || [];

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
      subject: subject,
      text: message,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.response);
    res.status(200).json({ success: true, message: 'Correo enviado exitosamente.' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ success: false, message: 'Error al enviar correo.', error });
  }
});

app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
  try {
    const pdfBuffer = req.file.buffer;
    const recipientEmail = req.body.recipientEmail;
    const documentTitle = req.body.documentTitle;

    const uploadResponse = await axios.post(
      'https://api.pdf.co/v1/file/upload',
      pdfBuffer,
      {
        headers: {
          'x-api-key': process.env.PDFCO_API_KEY,
          'Content-Type': 'application/octet-stream',
        },
        params: {
          name: `${documentTitle}.pdf`,
        },
      }
    );

    const fileUrl = uploadResponse.data.url;

    const annotations = [{
      x: 400,
      y: 100,
      text: "Firma aquí",
      type: "signature",
      pages: "1",
      recipientname: "Cliente",
      recipientemail: recipientEmail,
      role: "signer"
    }];

    const signResponse = await axios.post(
      'https://api.pdf.co/v1/pdf/sign/add',
      {
        url: fileUrl,
        name: documentTitle,
        annotations,
        async: false,
      },
      {
        headers: {
          'x-api-key': process.env.PDFCO_API_KEY,
          'Content-Type': 'application/json',
        }
      }
    );

    res.status(200).json({ success: true, result: signResponse.data });
  } catch (error) {
    console.error('Error al enviar a PDF.co:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error al enviar a PDF.co',
      error: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en el puerto ${PORT}`);
});
