import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface Setting {
  id: string;
  key: string;
  value: any;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

interface FindSettingsParams {
  search?: string;
}

export function useSettings(params?: FindSettingsParams) {
  return useQuery({
    queryKey: ['settings', params],
    queryFn: async () => {
      const { data } = await api.get<Setting[]>('/settings', {
        params,
      });
      return data;
    },
  });
}

export function useSetting(key: string | null) {
  return useQuery({
    queryKey: ['settings', key],
    queryFn: async () => {
      if (!key) return null;
      const { data } = await api.get<Setting>(`/settings/${key}`);
      return data;
    },
    enabled: !!key,
  });
}

export function useCreateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { key: string; value: any }) => {
      const { data } = await api.post<Setting>('/settings', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Configuração criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar configuração.');
    },
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, payload }: { key: string; payload: { value: any } }) => {
      const { data } = await api.put<Setting>(`/settings/${key}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings', variables.key] });
      toast.success('Configuração atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar configuração.');
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: { key: string; value: any }[]) => {
      const results = await Promise.allSettled(
        settings.map((setting) =>
          api.put<Setting>(`/settings/${setting.key}`, { value: setting.value }).catch((error) => {
            const err = new Error(error.message);
            (err as any).key = setting.key;
            throw err;
          })
        )
      );

      const failed = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
      if (failed.length > 0) {
        const failedKeys = failed.map((f) => (f.reason as any).key || 'desconhecido');
        throw new Error(`Erro ao salvar as chaves: ${failedKeys.join(', ')}. Verifique os valores e tente novamente.`);
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Configurações salvas com sucesso!');
    },
    onError: (error: any) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.error(error.message || 'Erro ao salvar algumas configurações.');
    },
  });
}

export function useDeleteSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      const { data } = await api.delete(`/settings/${key}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success(`Configuração excluída com sucesso!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir configuração.');
    },
  });
}
