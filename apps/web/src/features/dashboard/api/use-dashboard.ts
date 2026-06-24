import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DashboardData {
  kpis: {
    activeLeads: number;
    openDeals: number;
    expectedRevenue: number;
    pendingActivities: number;
  };
  recentLeads: {
    id: string;
    name: string;
    company: string;
    value: number;
    status: string;
  }[];
  recentActivities: {
    id: string;
    title: string;
    type: string;
    dueDate: string;
    isDone: boolean;
    relatedTo: string;
  }[];
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const { data } = await api.get<DashboardData>('/analytics/dashboard');
      return data;
    },
  });
}
