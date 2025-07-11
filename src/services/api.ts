// src/services/api.ts
const API_URL = import.meta.env.VITE_API_URL;

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

export default api;
