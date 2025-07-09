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

// 🎉 Email de bienvenida para agentes nuevos
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
      <p>Te damos la bienvenida a nuestra plataforma CRM.</p>
      <p><strong>Tu usuario:</strong> ${email}</p>
      <p><strong>Tu contraseña temporal:</strong> ${tempPassword}</p>
      <p>Este enlace te lleva directamente al sistema: 
        <a href="https://crm.insurancemultiservices.com" target="_blank">
          crm.insurancemultiservices.com
        </a>
      </p>
      <p><strong>Importante:</strong> Esta contraseña temporal expirará en 24 horas. Te pediremos que la cambies al iniciar sesión.</p>
      <br/>
      <p>Saludos,<br>Equipo de Insurance Multiservices</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// 📨 Email de mensajes enviados por el sistema
export const sendSystemMessageEmail = async (
  toEmail: string,
  subject: string,
  content: string
) => {
  const mailOptions = {
    from: `"Insurance Multiservices" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: subject || 'Nuevo mensaje del sistema',
    html: `
      <h3>Has recibido un nuevo mensaje</h3>
      <p>${content}</p>
      <br/>
      <p>Este mensaje ha sido enviado desde el sistema CRM de Insurance Multiservices.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
