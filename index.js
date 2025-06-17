
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const upload = multer();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 10000;

app.post('/api/send-signature-request', upload.none(), async (req, res) => {
  try {
    const { html, recipientEmail, documentTitle } = req.body;

    if (!html || !recipientEmail || !documentTitle) {
      return res.status(400).json({ error: true, message: 'Parámetros incompletos.' });
    }

    const annotations = [
      {
        x: 400,
        y: 100,
        text: 'Firma aquí',
        type: 'signature',
        pages: '1',
        recipientName: 'Cliente',
        recipientEmail,
        role: 'signer'
      }
    ];

    const pdfcoResponse = await axios.post(
      'https://api.pdf.co/v1/pdf/sign/add',
      {
        html,
        name: documentTitle,
        annotations
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.PDFCO_API_KEY
        }
      }
    );

    return res.json({ success: true, result: pdfcoResponse.data });
  } catch (error) {
    console.error('Error al enviar a PDF.co:', error.message);
    return res.status(500).json({ error: true, message: `Error al enviar a PDF.co: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
