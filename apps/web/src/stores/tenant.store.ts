import { create } from 'zustand';

interface TenantState {
  tenantId: string | null;
  setTenantId: (id: string) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenantId: null, // Caso não exista, o usuário será redirecionado para a seleção
  setTenantId: (tenantId) => set({ tenantId }),
  clearTenant: () => set({ tenantId: null }),
}));
