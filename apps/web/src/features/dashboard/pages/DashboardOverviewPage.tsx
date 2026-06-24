import * as React from 'react';
import { Users, Briefcase, DollarSign, Clock, Mail, Phone, Calendar, Loader2 } from 'lucide-react';
import { MetricCard } from '@/components/ui/metric-card';
import { Timeline, TimelineContent, TimelineDescription, TimelineItem, TimelineTime, TimelineTitle } from '@/components/ui/timeline';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { useDashboardOverview } from '../api/use-dashboard';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const leadsColumns = [
  { accessorKey: 'name', header: 'Nome do Lead' },
  { accessorKey: 'company', header: 'Empresa' },
  { 
    accessorKey: 'value', 
    header: 'Valor Previsto',
    cell: ({ row }: any) => {
      const amount = parseFloat(row.getValue('value'));
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    }
  },
  { 
    accessorKey: 'status', 
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status');
      const variant = status === 'NEW' ? 'default' : status === 'CONTACTED' ? 'secondary' : 'outline';
      return <Badge variant={variant as any}>{status}</Badge>;
    }
  },
];

export function DashboardOverviewPage() {
  const { data, isLoading } = useDashboardOverview();

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { kpis, recentLeads, recentActivities } = data;

  const formattedRevenue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: "compact",
    compactDisplay: "short"
  }).format(kpis.expectedRevenue);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CALL': return { icon: <Phone className="h-3 w-3" />, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400' };
      case 'EMAIL': return { icon: <Mail className="h-3 w-3" />, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' };
      case 'MEETING': return { icon: <Calendar className="h-3 w-3" />, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400' };
      default: return { icon: <Clock className="h-3 w-3" />, color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Leads Ativos"
          value={kpis.activeLeads.toString()}
          trend="neutral"
          trendValue=""
          description="Total na base"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Negócios Abertos"
          value={kpis.openDeals.toString()}
          trend="neutral"
          trendValue=""
          description="Pipeline atual"
          icon={<Briefcase className="h-4 w-4" />}
        />
        <MetricCard
          title="Receita Prevista"
          value={formattedRevenue}
          trend="neutral"
          trendValue=""
          description="Soma dos negócios abertos"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="Atividades Pendentes"
          value={kpis.pendingActivities.toString()}
          trend={kpis.pendingActivities > 10 ? 'down' : 'neutral'}
          trendValue=""
          description="Requer atenção"
          icon={<Clock className="h-4 w-4 text-orange-500" />}
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Recent Leads Table */}
        <div className="col-span-1 lg:col-span-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Leads Recentes</h2>
          </div>
          <DataTable columns={leadsColumns} data={recentLeads} />
        </div>

        {/* Timeline / Activities */}
        <div className="col-span-1 lg:col-span-3 rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Atividades Recentes</h2>
          </div>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma atividade pendente.</p>
          ) : (
            <Timeline>
              {recentActivities.map((activity) => {
                const style = getActivityIcon(activity.type);
                return (
                  <TimelineItem key={activity.id} icon={style.icon} iconClassName={style.color}>
                    <TimelineContent>
                      <TimelineTime>
                        {formatDistanceToNow(new Date(activity.dueDate), { addSuffix: true, locale: ptBR })}
                      </TimelineTime>
                      <TimelineTitle>{activity.title}</TimelineTitle>
                      <TimelineDescription>Relacionado a: {activity.relatedTo}</TimelineDescription>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </Timeline>
          )}
        </div>

      </div>
    </div>
  );
}
