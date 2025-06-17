require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor backend para PDF.co funcionando 🚀');
});

app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
  try {
    const { recipientEmail, documentTitle } = req.body;
    const pdfPath = req.file.path;

    // Subir el PDF a PDF.co para generar una URL pública temporal
    const formData = new FormData();
    formData.append('file', fs.createReadStream(pdfPath));

    const uploadResponse = await axios.post(
      'https://api.pdf.co/v1/file/upload/get-presigned-url?name=documento.pdf&contenttype=application/pdf',
      null,
      { headers: { 'x-api-key': process.env.PDFCO_API_KEY } }
    );

    const { presignedUrl, url } = uploadResponse.data;

    // Subir el archivo a la URL proporcionada por PDF.co
    await axios.put(presignedUrl, fs.readFileSync(pdfPath), {
      headers: { 'Content-Type': 'application/pdf' },
    });

    // Llamar al endpoint para firma
    const signatureResponse = await axios.post(
      'https://api.pdf.co/v1/pdf/sign/add',
      JSON.stringify({
        url,
        name: documentTitle || 'Documento',
        recipient: recipientEmail,
        async: false
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.PDFCO_API_KEY
        }
      }
    );

    fs.unlinkSync(pdfPath);
    res.status(200).json({ status: 'success', result: signatureResponse.data });

  } catch (error) {
    console.error('Error al enviar a PDF.co:', error.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      errorCode: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en el puerto ${PORT}`);
});