import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: null | { id: string; email: string; name?: string };
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setAuth: (token, user) => {
    localStorage.setItem('access_token', token);
    set({ isAuthenticated: true, user });
  },
  logout: () => {
    localStorage.removeItem('access_token');
    set({ isAuthenticated: false, user: null });
  },
}));
