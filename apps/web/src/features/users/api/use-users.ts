import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api as apiClient } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle?: string | null;
  isActive: boolean;
  userRoles?: { role?: { name: string } }[];
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: User[] }>('/users', {
        params: { limit: 100 },
      });
      return data;
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, adminPassword }: { id: string; adminPassword: string }) => {
      const { data } = await apiClient.delete(`/users/${id}`, {
        data: { adminPassword },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
