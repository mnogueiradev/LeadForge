import { apiClient } from '../../../services/api.client';

export const authApi = {
  login: async (credentials: any) => {
    // Exemplo de integração futura
    // const { data } = await apiClient.post('/auth/login', credentials);
    // return data;
    return { token: 'mock-token', user: { id: '1', name: 'Admin', email: 'admin@leadforge.com', roles: ['admin'], permissions: ['all'] } };
  },
  me: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
  logout: async () => {
    await apiClient.post('/auth/logout');
  }
};
