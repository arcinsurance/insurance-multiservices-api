
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { DropboxSign } = require('@dropbox/sign');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));

// Configuración de Dropbox Sign
const dropboxSign = new DropboxSign({ accessKey: process.env.DROPBOXSIGN_API_KEY });

// API /api/send-email
app.post('/api/send-email', async (req, res) => {
    const { recipientEmail, documentName, documentBase64 } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"Insurance Multiservices" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: `Documento: ${documentName}`,
        text: 'Estimado cliente, le enviamos el documento adjunto para su revisión/firma.',
        attachments: [
            {
                filename: documentName,
                content: documentBase64.split('base64,')[1],
                encoding: 'base64'
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ status: 'ok' });
    } catch (error) {
        console.error('Error enviando email:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// API /api/send-to-sign
app.post('/api/send-to-sign', async (req, res) => {
    const { recipientEmail, documentName, documentBase64 } = req.body;

    try {
        const fileBuffer = Buffer.from(documentBase64.split('base64,')[1], 'base64');

        const response = await dropboxSign.signatureRequest.send({
            test_mode: true,
            title: documentName,
            subject: 'Por favor firme el documento',
            message: 'Estimado cliente, le enviamos el documento para su firma.',
            signers: [
                { email_address: recipientEmail, name: recipientEmail.split('@')[0] }
            ],
            files: [
                {
                    name: documentName,
                    file: fileBuffer
                }
            ]
        });

        res.json({
            status: 'ok',
            signatureRequestId: response.signature_request.signature_request_id
        });
    } catch (error) {
        console.error('Error enviando a firma:', error.response?.data || error.message);
        res.status(500).json({ status: 'error', message: error.response?.data || error.message });
    }
});

// Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend escuchando en puerto ${PORT}`);
});
