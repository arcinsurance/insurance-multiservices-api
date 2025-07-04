import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendAgentWelcomeEmail = async (
  email: string,
  fullName: string,
  tempPassword: string
) => {
  const mailOptions = {
    from: `"Insurance Multiservices" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Bienvenido al CRM de Insurance Multiservices',
    html: `
      <h2>Hola ${fullName},</h2>
      <p>Te damos la bienvenida a la plataforma CRM de Insurance Multiservices.</p>

      <p><strong>Tu usuario:</strong> ${email}</p>
      <p><strong>Tu contraseña temporal:</strong> ${tempPassword}</p>

      <p>⚠️ <strong>Importante:</strong> Esta contraseña temporal es válida solo por <strong>24 horas</strong>. Al ingresar por primera vez, deberás cambiarla por una definitiva.</p>

      <p>Puedes acceder aquí: 
        <a href="https://crm.insurancemultiservices.com" target="_blank">
          https://crm.insurancemultiservices.com
        </a>
      </p>

      <br/>
      <p>Saludos,<br>Equipo de Insurance Multiservices</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
