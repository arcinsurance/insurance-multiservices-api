
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const upload = multer();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
  const pdfBuffer = req.file?.buffer;
  const recipientEmail = req.body.recipientEmail;
  const documentTitle = req.body.documentTitle;

  if (!pdfBuffer || !recipientEmail || !documentTitle) {
    return res.status(400).json({ error: true, message: 'Missing required fields.' });
  }

  try {
    const pdfBase64 = pdfBuffer.toString('base64');
    const payload = {
      name: documentTitle,
      url: `data:application/pdf;base64,${pdfBase64}`,
      annotations: [
        {
          text: "Firma aquí",
          x: 100,
          y: 100,
          pages: "1",
          type: "signature",
          width: 200,
          height: 50
        }
      ]
    };

    const pdfcoResponse = await axios.post(
      'https://api.pdf.co/v1/pdf/edit/add',
      payload,
      {
        headers: {
          'x-api-key': process.env.PDFCO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (pdfcoResponse.data.error) {
      return res.status(500).json({ error: true, message: pdfcoResponse.data.message });
    }

    res.json({ success: true, data: pdfcoResponse.data });
  } catch (err) {
    console.error('Error al enviar a PDF.co:', err.message);
    res.status(500).json({ error: true, message: `Error al enviar a PDF.co: ${err.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en el puerto ${PORT}`);
});
