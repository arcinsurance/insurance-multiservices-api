const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Ruta para enviar documentos a la firma usando PDF.co
app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
  const file = req.file;
  const recipientEmail = req.body.recipientEmail;
  const documentTitle = req.body.documentTitle;

  if (!file || !recipientEmail || !documentTitle) {
    return res.status(400).json({ error: 'Faltan datos requeridos.' });
  }

  try {
    // Leer el archivo PDF y convertirlo en base64
    const pdfBuffer = fs.readFileSync(file.path);
    const base64Content = pdfBuffer.toString('base64');

    // Preparar datos para PDF.co
    const pdfCoResponse = await axios.post(
      'https://api.pdf.co/v1/pdf/sign/add',
      {
        name: documentTitle,
        url: `data:application/pdf;base64,${base64Content}`,
        async: false,
        profiles: JSON.stringify({
          signatures: [
            {
              position: 'middle-center',
              pages: '1',
              name: recipientEmail,
              signerName: recipientEmail,
              signerEmail: recipientEmail
            }
          ]
        })
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.PDFCO_API_KEY
        }
      }
    );

    fs.unlinkSync(file.path); // Eliminar archivo temporal

    if (pdfCoResponse.data.error) {
      return res.status(500).json({
        error: true,
        message: 'Error en PDF.co',
        details: pdfCoResponse.data
      });
    }

    res.status(200).json({
      success: true,
      pdfco: pdfCoResponse.data
    });

  } catch (error) {
    console.error('Error al enviar a PDF.co:', error.message);
    res.status(500).json({
      error: true,
      message: 'Error al enviar documento a PDF.co',
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en el puerto ${PORT}`);
});
