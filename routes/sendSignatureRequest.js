
import express from 'express';
import multer from 'multer';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const upload = multer();

router.post('/send-signature-request', upload.single('pdf'), async (req, res) => {
  try {
    const base64File = req.file.buffer.toString('base64');
    const { recipientEmail, documentTitle } = req.body;

    const annotations = [{
      text: "Firme aquí",
      x: 50,
      y: 700,
      pages: "1",
      type: "signature",
      width: 150,
      height: 40
    }];

    const payload = {
      name: documentTitle,
      async: false,
      file: base64File,
      inline: true,
      annotations,
      profiles: ["signature"],
      encrypt: false,
      expiresIn: 72
    };

    const pdfcoResponse = await axios.post(
      'https://api.pdf.co/v1/pdf/sign/add',
      payload,
      {
        headers: {
          'x-api-key': process.env.PDFCO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({ success: true, pdfcoResponse: pdfcoResponse.data });
  } catch (error) {
    console.error('❌ Error PDF.co:', error.message);
    res.status(500).json({ success: false, error: 'Fallo al enviar documento a firma' });
  }
});

export default router;
