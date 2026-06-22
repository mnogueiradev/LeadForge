import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
export type LeadTemperature = 'COLD' | 'WARM' | 'HOT';
export type LeadSource = 'MANUAL' | 'WEB' | 'IMPORT' | 'REFERRAL';

export interface Lead {
  id: string;
  title: string;
  description?: string | null;
  status: LeadStatus;
  temperature?: LeadTemperature | null;
  source?: LeadSource | null;
  score?: number | null;
  estimatedValue?: number | null;
  contactId: string;
  organizationId?: string | null;
  ownerUserId?: string | null;
  createdAt: string;
  updatedAt: string;
  contact?: { id: string; firstName: string; lastName: string } | null;
  organization?: { id: string; name: string } | null;
  owner?: { id: string; firstName: string; lastName: string } | null;
}

export interface LeadsResponse {
  data: Lead[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface FindLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
  temperature?: LeadTemperature;
  source?: LeadSource;
  contactId?: string;
  organizationId?: string;
  ownerUserId?: string;
}

// Hooks

export function useLeads(params?: FindLeadsParams) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: async () => {
      const { data } = await api.get<LeadsResponse>('/leads', {
        params,
      });
      return data;
    },
  });
}

export function useLead(id: string | null) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get<Lead>(`/leads/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Lead>) => {
      const { data } = await api.post<Lead>('/leads', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Lead> }) => {
      const { data } = await api.patch<Lead>(`/leads/${id}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/leads/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useArchiveLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/leads/${id}/archive`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
