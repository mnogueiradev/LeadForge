import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api as apiClient } from '@/lib/api';

export type DealStatus = 'OPEN' | 'WON' | 'LOST' | 'ARCHIVED';

export interface Deal {
  id: string;
  title: string;
  description?: string | null;
  value?: number | null;
  currency: string;
  probability: number;
  status: DealStatus;
  stageId: string;
  pipelineId: string;
  organizationId?: string | null;
  contactId?: string | null;
  ownerUserId: string;
  expectedCloseDate?: string | null;
  organization?: { id: string; name: string } | null;
  contact?: { id: string; firstName: string; lastName: string } | null;
  owner?: { id: string; firstName: string; lastName: string } | null;
}

interface FindDealsParams {
  pipelineId?: string;
  stageId?: string;
  status?: DealStatus;
  page?: number;
  limit?: number;
}

export function useDeals(params?: FindDealsParams) {
  return useQuery({
    queryKey: ['deals', params],
    queryFn: async () => {
      const { data } = await apiClient.get<Deal[]>('/deals', { params });
      return data;
    },
    enabled: !!params?.pipelineId,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Deal>) => {
      const { data } = await apiClient.post<Deal>('/deals', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useMoveDealStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, toStageId, source = 'USER', reason }: { id: string; toStageId: string; source?: string; reason?: string }) => {
      const { data } = await apiClient.post<Deal>(`/deals/${id}/movements`, { toStageId, source, reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useDeal(id?: string) {
  return useQuery({
    queryKey: ['deals', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.get<Deal>(`/deals/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<Deal>) => {
      const { data } = await apiClient.patch<Deal>(`/deals/${id}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals', variables.id] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/deals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export interface TimelineEvent {
  id: string;
  tenantId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  actorUserId?: string | null;
  data: any;
  createdAt: string;
}

export interface TimelineResponse {
  data: TimelineEvent[];
  meta: {
    total: number;
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
  }
}

export function useDealTimeline(dealId?: string) {
  return useQuery({
    queryKey: ['deals', dealId, 'timeline'],
    queryFn: async () => {
      if (!dealId) return null;
      const { data } = await apiClient.get<TimelineResponse>('/timeline/entity', {
        params: {
          entityType: 'DEAL',
          entityId: dealId,
          limit: 50,
        }
      });
      return data;
    },
    enabled: !!dealId,
  });
}
