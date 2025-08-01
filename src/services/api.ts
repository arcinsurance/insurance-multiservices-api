// src/services/api.ts

const API_URL = import.meta.env.VITE_API_URL || process.env.VITE_API_URL || 'http://localhost:3000';

const api = {
  get: async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      ...options,
      credentials: 'include', // útil si usas cookies (opcional)
    });
    if (!response.ok) throw new Error(`GET ${endpoint} failed (${response.status})`);
    return response.json();
  },

  post: async (endpoint: string, data: any, options: RequestInit = {}) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      body: JSON.stringify(data),
      credentials: 'include', // útil si usas cookies (opcional)
      ...options,
    });
    if (!response.ok) throw new Error(`POST ${endpoint} failed (${response.status})`);
    return response.json();
  },

  put: async (endpoint: string, data: any, options: RequestInit = {}) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      body: JSON.stringify(data),
      credentials: 'include', // útil si usas cookies (opcional)
      ...options,
    });
    if (!response.ok) throw new Error(`PUT ${endpoint} failed (${response.status})`);
    return response.json();
  },

  // Si necesitas DELETE:
  delete: async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'DELETE',
      credentials: 'include', // útil si usas cookies (opcional)
      ...options,
    });
    if (!response.ok) throw new Error(`DELETE ${endpoint} failed (${response.status})`);
    return response.json();
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
    credentials: 'include',
  });

  if (!response.ok) throw new Error('No se pudo enviar el email con el archivo adjunto');
  return response.json();
};

export default api;
