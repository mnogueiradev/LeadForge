import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';
import { useTenantStore } from '../stores/tenant.store';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Importante para enviar cookies (Refresh Token)
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  const tenantId = useTenantStore.getState().tenantId;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (tenantId) {
    config.headers['X-Tenant-Id'] = tenantId;
  }

  return config;
});

// Resposta com interceptador para lidar com refresh tokens seria adicionado aqui.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Lógica para interceptar 401 e fazer refresh do token.
    return Promise.reject(error);
  }
);
