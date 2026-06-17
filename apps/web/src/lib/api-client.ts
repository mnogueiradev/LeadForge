import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true, // Crucial para enviar os cookies (Refresh Token) automaticamente
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to add Access Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor for Silent Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se receber 401 (Não autorizado) e ainda não tivermos tentado refazer
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tenta renovar usando o refresh token guardado no HttpOnly Cookie
        const { data } = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });

        // Salva o novo Access Token no LocalStorage
        localStorage.setItem('access_token', data.access_token);

        // Refaz a requisição original com o novo token
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Se falhar no refresh (ex: cookie expirou), força o logout
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
