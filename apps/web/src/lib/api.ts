import axios from 'axios';

// Cria a instância do Axios. 
// O baseURL '/api/v1' usará o proxy do Vite para bater em http://localhost:3001/api/v1
export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Garante envio/recebimento de cookies (ex: refresh_token)
});

let currentAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

export const getAccessToken = () => currentAccessToken;

// Request Interceptor para enviar o access_token em memória
api.interceptors.request.use((config) => {
  if (currentAccessToken && config.headers) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }
  return config;
});

// Variável para evitar múltiplos refreshs simultâneos
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor para capturar 401 e tentar o refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro foi 401 e ainda não tentamos dar refresh nessa requisição
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Ignora erro 401 nas rotas de auth (login, register, refresh) para não entrar em loop
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/register')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Coloca a requisição na fila aguardando o refresh terminar
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Tenta renovar a sessão
        const { data } = await api.post('/auth/refresh');
        const newToken = data.access_token;
        
        // Atualiza a flag e dispara a fila com sucesso
        isRefreshing = false;
        processQueue(null, newToken);

        // Define o novo token na requisição original e refaz a chamada
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
        return api(originalRequest);
      } catch (refreshError) {
        // Falhou o refresh (token expirou ou revogado)
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Emitimos um evento customizado para o AuthProvider forçar o logout visualmente
        window.dispatchEvent(new Event('session_expired'));
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
