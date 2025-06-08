
# Insurance Multiservices API

## Endpoints

### POST /api/send-email
Envía un email con documento adjunto.

Payload esperado:
```json
{
  "recipientEmail": "cliente@example.com",
  "documentName": "NombreDelDocumento.pdf",
  "documentBase64": "data:application/pdf;base64,..."
}
```

### POST /api/send-to-sign
Envía documento a firma con Dropbox Sign.

Payload esperado:
```json
{
  "recipientEmail": "cliente@example.com",
  "documentName": "NombreDelDocumento.pdf",
  "documentBase64": "data:application/pdf;base64,..."
}
```

## Variables de entorno (.env)
- EMAIL_USER
- EMAIL_PASS
- DROPBOXSIGN_API_KEY
