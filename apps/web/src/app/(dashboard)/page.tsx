'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

type AnalyticsData = {
  kpis: {
    totalLeads: number;
    convertedLeads: number;
    totalEstimatedValue: number;
    conversionRate: number;
  };
  charts: {
    funnel: { status: string; count: number }[];
    temperature: { temperature: string; count: number }[];
  };
  recentLeads: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    contactName: string;
    contactEmail: string;
    value: number;
  }[];
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];
const TEMP_COLORS: Record<string, string> = {
  HOT: '#ef4444',
  WARM: '#eab308',
  COLD: '#3b82f6',
};

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const response = await api.get('/analytics/dashboard');
      return response.data as AnalyticsData;
    },
  });

  if (isLoading) {
    return <div className="p-8">Carregando métricas...</div>;
  }

  if (isError || !data) {
    return <div className="p-8 text-red-500">Erro ao carregar o dashboard.</div>;
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.totalLeads}</div>
            <p className="text-xs text-muted-foreground">Oportunidades ativas no pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Convertidos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.convertedLeads}</div>
            <p className="text-xs text-muted-foreground">Fechamentos bem sucedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Percentual de ganho</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Estimada</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.kpis.totalEstimatedValue)}</div>
            <p className="text-xs text-muted-foreground">Potencial de receita no pipeline</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Funil de Vendas (Leads por Status)</CardTitle>
            <CardDescription>Distribuição atual de todas as oportunidades ativas.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.charts.funnel} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#8884d8" opacity={0.2} />
                <XAxis dataKey="status" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <RechartsTooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {data.charts.funnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Leads por Temperatura</CardTitle>
            <CardDescription>Qualidade das oportunidades no momento.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={data.charts.temperature}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="temperature"
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.charts.temperature.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TEMP_COLORS[entry.temperature] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads Recentes</CardTitle>
          <CardDescription>As 5 oportunidades mais recentes adicionadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{lead.title}</p>
                  <p className="text-sm text-muted-foreground">{lead.contactName}</p>
                </div>
                <div className="font-medium">{formatCurrency(lead.value)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
