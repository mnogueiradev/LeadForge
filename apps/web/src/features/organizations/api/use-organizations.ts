import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type OrganizationStatus = 'PROSPECT' | 'CUSTOMER' | 'PARTNER' | 'SUPPLIER' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type CompanySize = 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';

export interface OrganizationAddress {
  id?: string;
  street: string;
  number?: string;
  complement?: string;
  district?: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
}

export interface Organization {
  id: string;
  name: string;
  legalName?: string | null;
  document?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  industry?: string | null;
  companySize?: CompanySize | null;
  description?: string | null;
  status: OrganizationStatus;
  ownerUserId?: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: { id: string; firstName: string; lastName: string } | null;
  addresses?: OrganizationAddress[];
}

export interface OrganizationsResponse {
  data: Organization[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface FindOrganizationsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrganizationStatus;
}

// Hooks

export function useOrganizations(params?: FindOrganizationsParams) {
  return useQuery({
    queryKey: ['organizations', params],
    queryFn: async () => {
      const { data } = await api.get<OrganizationsResponse>('/organizations', {
        params,
      });
      return data;
    },
  });
}

export function useOrganization(id: string | null) {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get<Organization>(`/organizations/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Organization>) => {
      const { data } = await api.post<Organization>('/organizations', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Organization> }) => {
      const { data } = await api.patch<Organization>(`/organizations/${id}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizations', variables.id] });
    },
  });
}

export function useArchiveOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/organizations/${id}/archive`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/organizations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}
