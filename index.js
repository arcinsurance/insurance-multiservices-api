
import express from 'express';
import multer from 'multer';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const pdfBase64 = fileBuffer.toString('base64');

    const { recipientEmail, documentTitle } = req.body;

    const payload = {
      name: documentTitle,
      async: false,
      file: pdfBase64,
      annotations: [
        {
          x: 400,
          y: 100,
          text: "Firma aquí",
          type: "signature",
          pages: "1",
          recipientname: "Cliente",
          recipientemail: recipientEmail,
          role: "signer"
        }
      ]
    };

    const response = await axios.post(
      'https://api.pdf.co/v1/pdf/sign/add',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.PDFCO_API_KEY
        }
      }
    );

    const { url } = response.data;
    res.status(200).json({ success: true, url });

  } catch (error) {
    console.error('Error enviando a PDF.co:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Fallo al enviar documento a firma',
      error: error.response?.data || error.message
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
    