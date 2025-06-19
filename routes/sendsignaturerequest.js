const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/send-signature-request', async (req, res) => {
  const { name, email, documentUrl } = req.body;

  try {
    const response = await axios.post(
      'https://api.pdf.co/v1/sign/v2',
      {
        url: documentUrl,
        async: false,
        name,
        recipient: email,
        disableBrowserRedirect: true,
      },
      {
        headers: {
          'x-api-key': process.env.PDFCO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json({ message: 'Solicitud enviada', data: response.data });
  } catch (error) {
    console.error('Error al enviar solicitud de firma:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error al enviar solicitud de firma' });
  }
});

module.exports = router;