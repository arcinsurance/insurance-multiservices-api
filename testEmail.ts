import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Insurance Multiservices" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,  // te envía el correo a ti mismo
      subject: 'Test email nodemailer',
      text: 'Este es un correo de prueba desde nodemailer',
    });
    console.log('Email enviado:', info.messageId);
  } catch (error) {
    console.error('Error al enviar email:', error);
  }
}

testEmail();
