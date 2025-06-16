
const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const cors = require("cors");

const upload = multer();
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/send-communication-email", upload.array("attachments"), async (req, res) => {
  try {
    const recipientEmail = req.body.recipientEmail;
    const senderEmail = req.body.senderEmail;
    const subject = req.body.subject;
    const body = req.body.body;

    console.log("recipientEmail recibido:", recipientEmail);
    console.log("senderEmail recibido:", senderEmail);

    if (!recipientEmail || !subject || !body || !senderEmail) {
      return res.status(400).json({ error: "Faltan campos obligatorios en el formulario." });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      from: senderEmail,
      to: recipientEmail,
      subject,
      text: body,
      attachments: (req.files || []).map(file => ({
        filename: file.originalname,
        content: file.buffer
      }))
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado:", info.response);
    res.status(200).json({ message: "Correo enviado correctamente", response: info.response });

  } catch (error) {
    console.error("Error al enviar correo:", error);
    res.status(500).json({ error: "Error al enviar correo", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log("Servidor corriendo en el puerto", PORT);
});
