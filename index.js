
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

const app = express();
const upload = multer();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 10000;

app.post('/api/send-communication-email', upload.none(), async (req, res) => {
    const { recipientEmail, subject, message, senderEmail } = req.body;

    if (!recipientEmail || !subject || !message || !senderEmail) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    try {
        const info = await transporter.sendMail({
            from: senderEmail,
            to: recipientEmail,
            subject,
            html: message
        });
        console.log("Correo enviado:", info.response);
        res.json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error("Error al enviar correo:", error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
    const { recipientEmail, documentTitle } = req.body;
    const pdfBuffer = req.file?.buffer;

    if (!recipientEmail || !documentTitle || !pdfBuffer) {
        return res.status(400).json({ error: 'Missing required fields or PDF' });
    }

    try {
        const response = await axios.post(
            'https://api.pdf.co/v1/pdf/edit/add',
            {
                url: 'https://bytescout-com.s3.amazonaws.com/files/demo-files/cloud-api/pdf-to-text/sample.pdf',
                async: false,
                name: documentTitle,
                profiles: JSON.stringify({})
            },
            {
                headers: {
                    'x-api-key': process.env.PDFCO_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("PDF.co Response:", response.data);
        res.json({ message: 'Document sent for signature (PDF.co)', pdfco: response.data });
    } catch (error) {
        console.error("Error al enviar a PDF.co:", error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to send document via PDF.co', details: error.response?.data });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Backend escuchando en el puerto ${PORT}`);
});
