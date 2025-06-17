
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 10000;
const upload = multer({ dest: 'uploads/' });

app.use(cors());

app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
  try {
    const { recipientEmail, documentTitle } = req.body;
    const filePath = req.file.path;

    console.log("📨 Iniciando envío a firma PDF.co...");
    console.log("👉 Correo destinatario:", recipientEmail);
    console.log("📄 Título del documento:", documentTitle);

    const fileStream = fs.createReadStream(filePath);

    // Paso 1: Subir el archivo a PDF.co
    const uploadRes = await axios.post('https://api.pdf.co/v1/file/upload', fileStream, {
      headers: {
        'x-api-key': process.env.PDFCO_API_KEY,
        'Content-Type': 'application/octet-stream'
      }
    });

    const fileUrl = uploadRes.data.url;

    // Paso 2: Crear solicitud de firma
    const signRes = await axios.post('https://api.pdf.co/v1/pdf/sign/add', {
      url: fileUrl,
      name: documentTitle || 'Documento',
      async: false,
      profiles: JSON.stringify({ "signatures": [{ "pages": "1", "text": "Firma aquí", "x": 400, "y": 700, "width": 200, "height": 50 }] }),
      recipientName: recipientEmail.split('@')[0],
      recipientEmail: recipientEmail
    }, {
      headers: { 'x-api-key': process.env.PDFCO_API_KEY }
    });

    if (signRes.data.error) {
      console.error("🚨 Error al enviar a PDF.co:", signRes.data);
      return res.status(500).json(signRes.data);
    }

    console.log("✅ Solicitud de firma enviada correctamente:", signRes.data);
    res.json(signRes.data);
  } catch (error) {
    console.error("🚨 Error inesperado en backend:", error);
    res.status(500).json({ error: 'Error al procesar solicitud de firma.' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Backend escuchando en el puerto ${port}`);
});
