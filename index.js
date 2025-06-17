
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// Ruta para enviar documento a firma usando PDF.co
app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
    try {
        const { recipientEmail, documentTitle } = req.body;
        const pdfBuffer = req.file.buffer;

        // Codificar PDF en Base64
        const base64Pdf = pdfBuffer.toString('base64');

        // Configurar la solicitud a PDF.co
        const response = await axios.post(
            'https://api.pdf.co/v1/pdf/sign/add',
            {
                name: documentTitle || "documento.pdf",
                async: false,
                file: base64Pdf,
                annotations: [
                    {
                        text: 'Firma aquí',
                        x: 100,
                        y: 150,
                        pages: '1',
                        type: 'signature'
                    }
                ]
            },
            {
                headers: {
                    'x-api-key': process.env.PDFCO_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("✅ Documento enviado a PDF.co:", response.data);
        res.json({ success: true, response: response.data });
    } catch (error) {
        console.error("❌ Error al enviar a PDF.co:", error.response?.data || error.message);
        res.status(500).json({ error: true, message: error.response?.data || error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Backend escuchando en el puerto ${PORT}`);
});
