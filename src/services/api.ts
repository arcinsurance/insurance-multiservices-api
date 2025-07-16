// src/services/api.ts

const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';

const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_URL}/api${endpoint}`);
    if (!response.ok) throw new Error(`GET ${endpoint} failed`);
    return response.json();
  },

  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`POST ${endpoint} failed`);
    return response.json();
  },

  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`PUT ${endpoint} failed`);
  },
};

// ------ NUEVO: Enviar archivo adjunto (ejemplo: PDF) por email ------
export const sendEmailWithFile = async (
  file: File,
  to: string,
  subject: string,
  body: string
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('to', to);
  formData.append('subject', subject);
  formData.append('body', body);

  const response = await fetch(`${API_URL}/api/send-email`, {
    method: 'POST',
    body: formData,
    // No pongas Content-Type, fetch lo gestiona automáticamente con FormData
  });

  if (!response.ok) throw new Error('No se pudo enviar el email con el archivo adjunto');
  return response.json();
};

export default api;
