const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 10000;

app.post("/api/send-communication-email", async (req, res) => {
    const { recipientEmail, subject, body, senderEmail } = req.body;

    console.log("GMAIL_USER:", process.env.GMAIL_USER);
    console.log("GMAIL_PASS:", process.env.GMAIL_PASS ? "Definida" : "VACÍA");

    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        return res.status(500).json({ error: "Credenciales de Gmail no definidas en el entorno." });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        const mailOptions = {
            from: senderEmail || process.env.GMAIL_USER,
            to: recipientEmail,
            subject: subject,
            text: body,
        };

        let info = await transporter.sendMail(mailOptions);
        console.log("Correo enviado:", info.response);
        res.json({ message: "Correo enviado exitosamente." });
    } catch (error) {
        console.error("Error al enviar correo:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log("Servidor corriendo en el puerto", PORT);
});