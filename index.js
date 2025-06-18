require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('./nodemailer.config');

const app = express();
app.use(express.json());

// CORS solo para frontend autorizado
app.use(cors({
    origin: 'https://insurancemultiservices.com'
}));

app.post('/api/send-email', async (req, res) => {
    const { to, subject, message } = req.body;

    if (!to || !message) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
        await nodemailer.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: subject || 'Mensaje desde Insurance Multiservices',
            text: message,
        });

        res.status(200).json({ success: true, message: 'Correo enviado correctamente' });
    } catch (err) {
        console.error('Error al enviar correo:', err);
        res.status(500).json({ error: 'Error al enviar el correo' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});