const express = require('express');
const multer = require('multer');
const cors = require('cors');
const nodemailer = require('nodemailer');
const FormData = require('form-data');
const axios = require('axios');
require('dotenv').config();

const app = express();
const upload = multer();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.post('/api/send-communication-email', upload.array('attachments'), async (req, res) => {
    const { senderEmail, recipientEmail, subject, message } = req.body;
    const attachments = req.files.map(file => ({
        filename: file.originalname,
        content: file.buffer
    }));

    if (!recipientEmail || !subject || !message) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    const mailOptions = {
        from: senderEmail || process.env.GMAIL_USER,
        to: recipientEmail,
        subject,
        html: message,
        attachments
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado:', info.response);
        res.status(200).json({ success: true, message: 'Correo enviado correctamente' });
    } catch (error) {
        console.error('Error al enviar correo:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
    const { recipientEmail, documentTitle } = req.body;
    const pdfBuffer = req.file?.buffer;

    if (!recipientEmail || !documentTitle || !pdfBuffer) {
        return res.status(400).json({ error: 'Faltan datos requeridos para la firma' });
    }

    const formData = new FormData();
    formData.append('file', pdfBuffer, { filename: `${documentTitle}.pdf` });
    formData.append('name', documentTitle);
    formData.append('recipient', recipientEmail);
    formData.append('async', 'false');

    try {
        const response = await axios.post(
            'https://api.pdf.co/v1/pdf/edit/add',
            formData,
            {
                headers: {
                    'x-api-key': process.env.PDFCO_API_KEY,
                    ...formData.getHeaders()
                }
            }
        );
        console.log('Respuesta de PDF.co:', response.data);
        res.status(200).json({ success: true, response: response.data });
    } catch (error) {
        console.error('Error al enviar a PDF.co:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});

app.listen(port, () => {
    console.log(`🚀 Backend escuchando en el puerto ${port}`);
});