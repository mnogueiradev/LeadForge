import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type ActivityStatus = 'pending' | 'completed' | 'canceled';
export type ActivityType = 'call' | 'meeting' | 'email' | 'task' | 'whatsapp' | 'follow_up';
export type ActivityPriority = 'low' | 'medium' | 'high';

export interface Activity {
  id: string;
  tenantId: string;
  title: string;
  description: string | null;
  type: ActivityType;
  status: ActivityStatus;
  priority: ActivityPriority;
  dueDate: string;
  durationMinutes: number | null;
  location: string | null;
  completedAt: string | null;
  ownerUserId: string | null;
  contactId: string | null;
  organizationId: string | null;
  leadId: string | null;
  dealId: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  ownerUser?: { id: string; firstName: string; lastName: string } | null;
  contact?: { id: string; firstName: string; lastName: string } | null;
  organization?: { id: string; name: string } | null;
  deal?: { 
    id: string; 
    title: string;
    value?: number | null;
    probability?: number | null;
    updatedAt?: string | Date | null;
    stage?: { id: string; name: string; probability: number } | null;
    pipeline?: { id: string; name: string } | null;
  } | null;
}

export interface ListActivitiesFilters {
  status?: ActivityStatus | string;
  type?: ActivityType | string;
  priority?: ActivityPriority | string;
  ownerUserId?: string;
  contactId?: string;
  organizationId?: string;
  leadId?: string;
  dealId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
  pipelineId?: string;
  stageId?: string;
}

export interface ListActivitiesResponse {
  data: Activity[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Queries
export const useActivities = (filters: ListActivitiesFilters = {}) => {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: async () => {
      // Clean up undefined/empty filters to prevent sending them as query params
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '' && v !== 'all')
      );
      
      const { data } = await api.get<ListActivitiesResponse>('/activities', {
        params: cleanFilters,
      });
      return data;
    },
  });
};

// Mutations
export interface CreateActivityData {
  title: string;
  description?: string;
  type: ActivityType;
  priority?: ActivityPriority;
  dueDate?: string;
  durationMinutes?: number;
  location?: string;
  ownerUserId: string;
  contactId?: string;
  organizationId?: string;
  leadId?: string;
  dealId?: string;
}

export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateActivityData) => {
      const response = await api.post<Activity>('/activities', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export interface UpdateActivityData {
  title?: string;
  description?: string;
  type?: ActivityType;
  priority?: ActivityPriority;
  dueDate?: string;
  durationMinutes?: number;
  location?: string;
}

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateActivityData }) => {
      const response = await api.patch<Activity>(`/activities/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useCompleteActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<Activity>(`/activities/${id}/complete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useCancelActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<Activity>(`/activities/${id}/cancel`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useAssignActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ownerUserId }: { id: string; ownerUserId: string }) => {
      const response = await api.patch<Activity>(`/activities/${id}/assign`, { ownerUserId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};
