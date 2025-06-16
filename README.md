# Backend para Insurance Multiservices – Firma con HelloSign

Este backend permite:
- Enviar documentos PDF a HelloSign para firma digital.
- Recibir el PDF desde el frontend como archivo (no base64).
- Enviar la solicitud de firma correctamente a HelloSign.

## ✅ Requisitos

- Node.js y npm instalados.
- Cuenta en HelloSign con una API Key válida.

## 🚀 Instrucciones

1. Renombra `.env.example` a `.env` y agrega tu API Key:
```
HELLOSIGN_API_KEY=tu_clave
```

2. Instala dependencias:
```
npm install
```

3. Ejecuta el servidor local:
```
node index.js
```

## 📦 Despliegue en Render

1. Crea un nuevo servicio web.
2. Conecta tu repositorio GitHub (sube esta carpeta).
3. En "Build Command": `npm install`
4. En "Start Command": `node index.js`
5. En "Environment Variables" agrega:
   - `HELLOSIGN_API_KEY`: tu clave real

## 📬 Pruebas

Desde Postman o tu frontend, haz POST a:

```
POST /api/send-signature-request
FormData:
- pdf: archivo PDF
- recipientEmail: correo del firmante
```

✅ Si todo va bien, verás la respuesta de HelloSign con el ID de solicitud de firma.