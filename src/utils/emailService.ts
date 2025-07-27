import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/* -------------------------------------------------------------------------- */
/* Configuración del transporter                                              */
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
/* FUNCIÓN GENÉRICA: Enviar correo (detecta HTML automáticamente)             */
/* -------------------------------------------------------------------------- */
export async function sendEmail(
  recipientEmail: string,
  subject: string,
  body: string
): Promise<void> {
  // Detecta si el contenido tiene etiquetas HTML
  const hasHtml = /<([a-z][\s\S]*?)>/i.test(body);

  const mailOptions = {
    from: `"Insurance Multiservices" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject,
    ...(hasHtml ? { html: body } : { text: body }),
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Email enviado a ${recipientEmail} (asunto: "${subject}")`);
}

/* -------------------------------------------------------------------------- */
/* Mensaje de sistema para agentes (texto plano)                              */
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
/* Correo de bienvenida al agente recién creado (HTML)                        */
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
    <p><strong>Importante:</strong> La contraseña expirará en 24&nbsp;h. Cámbiala al iniciar sesión.</p>
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
/* Mensaje a clientes (HTML)                                                  */
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

/* -------------------------------------------------------------------------- */
/* Email para solicitud de firma digital (HTML profesional, personalizado)    */
/* -------------------------------------------------------------------------- */
export async function sendSignatureRequestEmail(
  recipientEmail: string,
  clientName: string,
  agent: { name: string; email: string; phone: string; npn: string },
  documentLink: string
): Promise<void> {
  const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Documento para firma digital</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f6fafd; margin: 0; padding: 0; }
      .container { max-width: 520px; margin: 30px auto; background: #fff; border-radius: 14px; box-shadow: 0 2px 14px #294c7e12; padding: 32px 28px; }
      .header { text-align: center; padding-bottom: 18px; border-bottom: 1px solid #e4e9f1; }
      .logo { width: 56px; margin-bottom: 6px; }
      .title { color: #2a4365; font-size: 1.2rem; margin: 0; }
      .msg { font-size: 1.08rem; color: #313d4f; margin: 30px 0 22px 0; line-height: 1.6; }
      .cta-btn {
        display: inline-block;
        background: #2563eb;
        color: #fff !important;
        padding: 15px 32px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 1.09rem;
        text-decoration: none;
        box-shadow: 0 4px 16px #2563eb44;
        margin: 12px 0 18px 0;
        transition: background .2s;
      }
      .cta-btn:hover { background: #1d4ed8; }
      .footer {
        color: #8791a7;
        font-size: 0.96rem;
        text-align: center;
        margin-top: 36px;
        border-top: 1px solid #e4e9f1;
        padding-top: 12px;
      }
      .signature {
        margin-top: 18px;
        color: #333;
        font-size: 1rem;
        font-weight: bold;
      }
      .signature span {
        display: block;
        font-weight: normal;
        color: #3b82f6;
        font-size: 0.98rem;
        margin-top: 2px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://crm.insurancemultiservices.com/assets/logo.png" alt="Insurance Multiservices" class="logo" />
        <h2 class="title">Documento para firma digital</h2>
      </div>
      <p class="msg">
        Estimado/a <b>${clientName}</b>,<br><br>
        Tu agente <strong>${agent.name}</strong> te ha enviado un documento para tu <b>firma digital</b>.<br>
        Por favor, revisa el documento y completa la firma en el enlace a continuación:
      </p>
      <div style="text-align: center;">
        <a class="cta-btn" href="${documentLink}" target="_blank">Firmar documento</a>
      </div>
      <div class="signature">
        ${agent.name}
        <span>NPN: ${agent.npn}</span>
        <span>Email: <a href="mailto:${agent.email}" style="color:#2563eb;text-decoration:none;">${agent.email}</a></span>
        <span>Teléfono: ${agent.phone}</span>
      </div>
      <div class="footer">
        Si tienes dudas, contáctanos:<br>
        <a href="mailto:info@insurancemultiservices.com">info@insurancemultiservices.com</a> | (813) 885-5296
        <br><br>
        <b>Insurance Multiservices</b> <br>
        <span style="color:#f6b423;letter-spacing:1px;">Express Vacations</span>
      </div>
    </div>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: `"Insurance Multiservices" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject: "Documento para firma electrónica",
    html,
  });

  console.log(`📧 Correo de firma digital enviado a cliente ${recipientEmail} por ${agent.name}`);
}
