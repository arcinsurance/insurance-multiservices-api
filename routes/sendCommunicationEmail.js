import express from 'express';
import nodemailer from 'nodemailer';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.post('/send-communication-email', upload.any(), async (req, res) => {
  const { subject, message, senderEmail, recipientEmail } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: senderEmail || process.env.GMAIL_USER,
      to: recipientEmail,
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).send('Failed to send email');
  }
});

export default router;
