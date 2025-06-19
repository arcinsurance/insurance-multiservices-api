const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { fileUrl, signerEmail, signerName } = req.body;

    const response = await axios.post(
      'https://api.pdf.co/v1/pdf/sign/add',
      {
        url: fileUrl,
        name: 'Document Signature',
        async: false,
        profiles: '{"signature": {}}',
        signatures: [
          {
            email: signerEmail,
            name: signerName,
            type: 1,
            x: 100,
            y: 100,
            width: 200,
            height: 50,
            page: 0,
          },
        ],
      },
      {
        headers: {
          'x-api-key': process.env.PDFCO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json({ resultUrl: response.data.url });
  } catch (error) {
    console.error('Error al enviar solicitud de firma:', error);
    res.status(500).json({ error: 'Error en la solicitud de firma' });
  }
});

module.exports = router;
