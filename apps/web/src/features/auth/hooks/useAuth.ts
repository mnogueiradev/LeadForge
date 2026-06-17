import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

export const useAuth = () => {
  const { setAuth, logout: storeLogout } = useAuthStore();

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      // The API returns { access_token, user: { id, email, name }, tenantId }
      const token = data.access_token;
      const user = data.user;
      const tenantId = data.tenantId;
      
      setAuth(token, user, tenantId);
      toast.success('Login realizado com sucesso!');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao realizar login. Verifique suas credenciais.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout fail on backend', e);
    } finally {
      storeLogout();
      window.location.href = '/login';
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Email de recuperação enviado!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao processar solicitação.');
      throw err;
    }
  };

  return {
    login,
    logout,
    forgotPassword,
  };
};
