import { useQuery } from '@tanstack/react-query';
import { api as apiClient } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle?: string | null;
  isActive: boolean;
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
