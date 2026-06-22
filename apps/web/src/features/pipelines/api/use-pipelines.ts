import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api as apiClient } from '@/lib/api';

export interface Pipeline {
  id: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  description?: string | null;
  displayOrder: number;
  color?: string | null;
  probability: number;
  pipelineId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PipelinesResponse {
  items: Pipeline[];
  total: number;
  skip?: number;
  take?: number;
}

// Pipelines Hooks

export function usePipelines() {
  return useQuery({
    queryKey: ['pipelines'],
    queryFn: async () => {
      const { data } = await apiClient.get<PipelinesResponse>('/pipelines');
      return data;
    },
  });
}

export function usePipeline(id?: string | null) {
  return useQuery({
    queryKey: ['pipelines', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.get<Pipeline>(`/pipelines/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Pipeline>) => {
      const { data } = await apiClient.post<Pipeline>('/pipelines', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
  });
}

export function useUpdatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Pipeline> }) => {
      const { data } = await apiClient.patch<Pipeline>(`/pipelines/${id}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      queryClient.invalidateQueries({ queryKey: ['pipelines', variables.id] });
    },
  });
}

export function useArchivePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/pipelines/${id}/archive`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      queryClient.invalidateQueries({ queryKey: ['pipelines', id] });
    },
  });
}

export function useDeletePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/pipelines/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      queryClient.invalidateQueries({ queryKey: ['pipelines', id] });
    },
  });
}

// Pipeline Stages Hooks

export function usePipelineStages(pipelineId?: string | null) {
  return useQuery({
    queryKey: ['pipelines', pipelineId, 'stages'],
    queryFn: async () => {
      if (!pipelineId) return [];
      const { data } = await apiClient.get<PipelineStage[]>(`/pipelines/${pipelineId}/stages`);
      return data;
    },
    enabled: !!pipelineId,
  });
}

export function useCreatePipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pipelineId, payload }: { pipelineId: string; payload: Partial<PipelineStage> }) => {
      const { data } = await apiClient.post<PipelineStage>(`/pipelines/${pipelineId}/stages`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines', variables.pipelineId, 'stages'] });
    },
  });
}

export function useUpdatePipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pipelineId, stageId, payload }: { pipelineId: string; stageId: string; payload: Partial<PipelineStage> }) => {
      const { data } = await apiClient.patch<PipelineStage>(`/pipelines/${pipelineId}/stages/${stageId}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines', variables.pipelineId, 'stages'] });
    },
  });
}

export function useDeletePipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pipelineId, stageId }: { pipelineId: string; stageId: string }) => {
      await apiClient.delete(`/pipelines/${pipelineId}/stages/${stageId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines', variables.pipelineId, 'stages'] });
    },
  });
}

export function useReorderPipelineStages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pipelineId, stages }: { pipelineId: string; stages: { id: string; displayOrder: number }[] }) => {
      const { data } = await apiClient.put<PipelineStage[]>(`/pipelines/${pipelineId}/stages/reorder`, { stages });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines', variables.pipelineId, 'stages'] });
    },
  });
}
