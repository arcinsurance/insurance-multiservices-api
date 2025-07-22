import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/* -------------------------------------------------------------------------- */
/*  Configuración del transporter                                             */
/* -------------------------------------------------------------------------- */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT ?? '465', 10),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* -------------------------------------------------------------------------- */
/* FUNCIÓN GENÉRICA: Enviar correo simple o con HTML                         */
/* -------------------------------------------------------------------------- */
export async function sendEmail(
  recipientEmail: string,
  subject: string,
  plainTextBody: string,
  htmlContent?: string
): Promise<void> {
  const mailOptions = {
    from: `"Insurance Multiservices" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject,
    text: plainTextBody,
    ...(htmlContent ? { html: htmlContent } : {}),
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Email enviado a ${recipientEmail} (asunto: "${subject}")`);
}

/* -------------------------------------------------------------------------- */
/* 1. Mensaje de sistema para AGENTES (texto plano)                           */
/* -------------------------------------------------------------------------- */
export async function sendSystemMessageEmail(
  recipientEmail: string,
  subject: string,
  content: string
): Promise<void> {
  const mailOptions = {
    from: `"Insurance Multiservices" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject,
    text: `${content}

---
Yosvanys R Guerra Valverde
Office Manager
Telf: 8138855296
Insurance Multiservices LLC`,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Email de sistema enviado a agente ${recipientEmail}`);
}

/* -------------------------------------------------------------------------- */
/* 2. Correo de BIENVENIDA al agente recién creado                            */
/* -------------------------------------------------------------------------- */
export async function sendAgentWelcomeEmail(
  email: string,
  fullName: string,
  tempPassword: string
): Promise<void> {
  const html = `
    <h2>Hola ${fullName},</h2>
    <p>Te damos la bienvenida a nuestra plataforma CRM.</p>
    <p><strong>Usuario:</strong> ${email}</p>
    <p><strong>Contraseña temporal:</strong> ${tempPassword}</p>
    <p>
      Acceso directo:
      <a href="https://crm.insurancemultiservices.com" target="_blank">
        crm.insurancemultiservices.com
      </a>
    </p>
    <p><strong>Importante:</strong> La contraseña expirará en 24&nbsp;h. Cámbiala
    al iniciar sesión.</p>
    <br/>
    <p>Saludos,<br/>Equipo de Insurance Multiservices</p>
  `;

  await transporter.sendMail({
    from: `"Insurance Multiservices" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Bienvenido al CRM de Insurance Multiservices',
    html,
  });

  console.log(`📧 Correo de bienvenida enviado a ${email}`);
}

/* -------------------------------------------------------------------------- */
/* 3. Mensaje a CLIENTES (HTML + firma del agente)                            */
/* -------------------------------------------------------------------------- */
export async function sendClientMessageEmail(
  recipientEmail: string,
  subject: string,
  content: string,
  senderName: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; color:#333;">
      <p>${content.replace(/\n/g, '<br/>')}</p>
      <br/>
      <p style="margin-top:40px;">Saludos cordiales,</p>
      <p><strong>${senderName}</strong><br/>Insurance Multiservices</p>
      <hr style="margin-top:40px;"/>
      <p style="font-size:12px;color:#999;">
        Este mensaje fue enviado automáticamente desde nuestro sistema.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Insurance Multiservices" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject,
    html,
  });

  console.log(`📧 Mensaje enviado al cliente ${recipientEmail} por ${senderName}`);
}
