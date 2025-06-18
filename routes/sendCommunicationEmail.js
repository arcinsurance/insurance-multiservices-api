
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export default async function sendCommunicationEmail(req, res) {
  try {
    const { recipientEmail, subject, message } = req.body;

    if (!recipientEmail || !subject || !message) {
      return res.status(400).json({ success: false, error: "Faltan campos requeridos." });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: recipientEmail,
      subject: subject,
      text: message
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${recipientEmail}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error al enviar email:", error.message || error);
    res.status(500).json({ success: false, error: "Fallo al enviar el email." });
  }
}
