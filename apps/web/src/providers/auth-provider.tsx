import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setAccessToken } from '@/lib/api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  tenantId: string;
  isActive: boolean;
}

export interface AuthContextType {
  user: User | null;
  tenant: string | null;
  role: any | null; // Expandir futuramente
  permissions: any[] | null; // Expandir futuramente
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<string | null>(null);
  const [role, setRole] = useState<any | null>(null);
  const [permissions, setPermissions] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Escuta o evento emitido pelo api.ts caso o refresh token expire
  useEffect(() => {
    const handleSessionExpired = () => {
      clearAuth();
    };
    window.addEventListener('session_expired', handleSessionExpired);
    return () => window.removeEventListener('session_expired', handleSessionExpired);
  }, []);

  const clearAuth = () => {
    setUser(null);
    setTenant(null);
    setRole(null);
    setPermissions(null);
    setAccessToken(null);
    setIsLoading(false);
  };

  const loadProfile = async () => {
    try {
      // O endpoint /users/me retorna o profile completo
      const { data: userProfile } = await api.get('/users/me');
      setUser(userProfile);
      setTenant(userProfile.tenantId);
      
      // Opcional: buscar permissões
      try {
        const { data: userPerms } = await api.get('/permissions/me');
        setPermissions(userPerms);
      } catch (err) {
        console.warn('Falha ao carregar permissões', err);
      }
    } catch (error) {
      console.error('Falha ao carregar perfil após obter token', error);
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.post('/auth/refresh');
      setAccessToken(data.access_token);
      await loadProfile();
    } catch (error) {
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  // Ao montar, tentamos recuperar a sessão automaticamente
  useEffect(() => {
    refreshSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials: any) => {
    const { data } = await api.post('/auth/login', credentials);
    setAccessToken(data.access_token);
    await loadProfile();
  };

  const register = async (userData: any) => {
    // Cadastro não loga automaticamente na API atual, ela só retorna mensagem de sucesso.
    // Dependendo do backend, podemos precisar logar na sequencia
    await api.post('/auth/register', userData);
    // Após sucesso, faremos login automaticamente para o usuário
    await login({ email: userData.email, password: userData.password });
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro no logout', error);
    } finally {
      clearAuth();
      // O redirecionamento será gerido pelo AuthGuard quando 'isAuthenticated' ficar false
    }
  };

  const value = {
    user,
    tenant,
    role,
    permissions,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
