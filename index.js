const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const app = express();
const upload = multer();
app.use(cors());

app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
  const { recipientEmail, documentTitle } = req.body;
  const pdfBuffer = req.file?.buffer;

  if (!pdfBuffer || !recipientEmail || !documentTitle) {
    return res.status(400).json({ error: 'Faltan datos necesarios para enviar a firma.' });
  }

  const base64PDF = pdfBuffer.toString('base64');

  const payload = {
    url: `data:application/pdf;base64,${base64PDF}`,
    name: documentTitle,
    async: false,
    annotations: [
      {
        text: 'Firma aquí',
        x: 50,
        y: 650,
        pages: '1',
        type: 'signature',
        width: 200,
        height: 50,
        recipientName: recipientEmail,
        recipientEmail: recipientEmail
      }
    ],
    profiles: 'signature',
    async: false,
    expiration: 3 // días
  };

  try {
    const response = await axios.post(
      'https://api.pdf.co/v1/pdf/edit/add',
      payload,
      {
        headers: {
          'x-api-key': process.env.PDFCO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.url) {
      return res.status(200).json({ message: 'Documento enviado a firma correctamente.', url: response.data.url });
    } else {
      return res.status(500).json({ error: 'Respuesta inválida de PDF.co', response: response.data });
    }
  } catch (error) {
    console.error('Error enviando a PDF.co:', error.response?.data || error.message);
    return res.status(500).json({
      error: true,
      message: 'Error enviando a PDF.co',
      details: error.response?.data || error.message
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en el puerto ${PORT}`);
});
