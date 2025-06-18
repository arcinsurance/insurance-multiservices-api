
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const upload = multer();
const PORT = process.env.PORT || 10000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.post('/api/send-communication-email', upload.none(), async (req, res) => {
    try {
        const { senderEmail, recipientEmail, subject, message } = req.body;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        const mailOptions = {
            from: senderEmail,
            to: recipientEmail,
            subject,
            text: message,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email enviado con éxito' });
    } catch (error) {
        console.error('Error enviando email:', error);
        res.status(500).json({ error: 'Fallo al enviar el email' });
    }
});

app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
    try {
        const { recipientEmail, documentTitle } = req.body;
        const pdfBuffer = req.file.buffer;

        const formData = new FormData();
        formData.append('file', pdfBuffer, documentTitle);
        formData.append('name', documentTitle);
        formData.append('annotations', JSON.stringify([{
            x: 400,
            y: 100,
            text: "Firma aquí",
            type: "signature",
            pages: "1",
            recipientname: "Cliente",
            recipientemail: recipientEmail,
            role: "signer"
        }]));

        const response = await axios.post('https://api.pdf.co/v1/pdf/sign/add', formData, {
            headers: {
                'x-api-key': process.env.PDFCO_API_KEY,
                ...formData.getHeaders()
            }
        });

        res.status(200).json({ message: 'Documento enviado para firma', data: response.data });
    } catch (error) {
        console.error('Error enviando a PDF.co:', error.response?.data || error.message);
        res.status(500).json({ error: 'Fallo al enviar documento a firma' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
