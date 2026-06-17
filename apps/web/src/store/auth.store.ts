import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  tenantId: string | null;
  setAuth: (token: string, user: User, tenantId: string) => void;
  setTenantId: (tenantId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      tenantId: null,
      setAuth: (token, user, tenantId) => set({ token, user, tenantId }),
      setTenantId: (tenantId) => set({ tenantId }),
      logout: () => set({ token: null, user: null, tenantId: null }),
    }),
    {
      name: 'leadforge-auth-storage',
    }
  )
);
