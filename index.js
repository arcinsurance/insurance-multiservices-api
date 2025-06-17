
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
  try {
    const { recipientEmail, documentTitle } = req.body;
    const filePath = req.file.path;

    // Paso 1: Subir PDF a PDF.co
    const uploadForm = new FormData();
    uploadForm.append('file', fs.createReadStream(filePath));

    const uploadResponse = await axios.post('https://api.pdf.co/v1/file/upload', uploadForm, {
      headers: {
        'x-api-key': process.env.PDFCO_API_KEY,
        ...uploadForm.getHeaders()
      }
    });

    const fileUrl = uploadResponse.data.url;

    // Paso 2: Enviar solicitud de firma
    const payload = {
      url: fileUrl,
      name: documentTitle,
      async: false,
      annotations: JSON.stringify([{
        x: 400,
        y: 100,
        text: "Firma aquí",
        type: "signature",
        pages: "1",
        recipientname: "Cliente",
        recipientemail: recipientEmail,
        role: "signer"
      }])
    };

    const signatureResponse = await axios.post('https://api.pdf.co/v1/pdf/sign/add', payload, {
      headers: {
        'x-api-key': process.env.PDFCO_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    // Eliminar archivo temporal
    fs.unlinkSync(filePath);

    res.json({ message: 'Documento enviado a PDF.co correctamente', response: signatureResponse.data });
  } catch (error) {
    console.error('Error enviando a PDF.co:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Error al enviar a PDF.co',
      error: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en el puerto ${PORT}`);
});
