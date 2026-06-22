import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type ContactStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type ContactSource = 'MANUAL' | 'WEB' | 'IMPORT' | 'REFERRAL';

export interface Contact {
  id: string;
  firstName: string;
  lastName?: string | null;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  birthDate?: string | null;
  status: ContactStatus;
  source: ContactSource;
  description?: string | null;
  organizationId?: string | null;
  ownerUserId?: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: { id: string; firstName: string; lastName: string } | null;
  organization?: { id: string; name: string } | null;
}

export interface ContactsResponse {
  data: Contact[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface FindContactsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContactStatus;
  source?: ContactSource;
  organizationId?: string;
  ownerUserId?: string;
}

// Hooks

export function useContacts(params?: FindContactsParams) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: async () => {
      const { data } = await api.get<ContactsResponse>('/contacts', {
        params,
      });
      return data;
    },
  });
}

export function useContact(id: string | null) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get<Contact>(`/contacts/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Contact>) => {
      const { data } = await api.post<Contact>('/contacts', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Contact> }) => {
      const { data } = await api.patch<Contact>(`/contacts/${id}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contacts', variables.id] });
    },
  });
}

export function useArchiveContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/contacts/${id}/archive`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/contacts/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
