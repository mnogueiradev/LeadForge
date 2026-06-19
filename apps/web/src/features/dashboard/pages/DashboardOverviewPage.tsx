import * as React from 'react';
import { Users, Briefcase, DollarSign, Clock, Mail, Phone, Calendar } from 'lucide-react';
import { MetricCard } from '@/components/ui/metric-card';
import { Timeline, TimelineContent, TimelineDescription, TimelineItem, TimelineTime, TimelineTitle } from '@/components/ui/timeline';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';

const recentLeadsData = [
  { id: '1', name: 'Maria Silva', company: 'Tech Solutions', value: 'R$ 15.000', status: 'Novo' },
  { id: '2', name: 'João Souza', company: 'Acme Corp', value: 'R$ 8.500', status: 'Em Contato' },
  { id: '3', name: 'Ana Costa', company: 'Global Services', value: 'R$ 42.000', status: 'Qualificado' },
  { id: '4', name: 'Pedro Alves', company: 'InovaTech', value: 'R$ 5.200', status: 'Novo' },
];

const leadsColumns = [
  { accessorKey: 'name', header: 'Nome do Lead' },
  { accessorKey: 'company', header: 'Empresa' },
  { accessorKey: 'value', header: 'Valor Previsto' },
  { 
    accessorKey: 'status', 
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status');
      const variant = status === 'Novo' ? 'default' : status === 'Em Contato' ? 'secondary' : 'outline';
      return <Badge variant={variant as any}>{status}</Badge>;
    }
  },
];

export function DashboardOverviewPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Leads Ativos"
          value="245"
          trend="up"
          trendValue="+12%"
          description="vs mês passado"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Negócios Abertos"
          value="43"
          trend="up"
          trendValue="+4"
          description="novos nesta semana"
          icon={<Briefcase className="h-4 w-4" />}
        />
        <MetricCard
          title="Receita Prevista"
          value="R$ 1.2M"
          trend="neutral"
          trendValue="Estável"
          description="pipeline 30 dias"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="Atividades Pendentes"
          value="12"
          trend="down"
          trendValue="-3"
          description="vs ontem"
          icon={<Clock className="h-4 w-4 text-orange-500" />}
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Recent Leads Table */}
        <div className="col-span-1 lg:col-span-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Leads Recentes</h2>
          </div>
          <DataTable columns={leadsColumns} data={recentLeadsData} />
        </div>

        {/* Timeline / Activities */}
        <div className="col-span-1 lg:col-span-3 rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Atividades Recentes</h2>
          </div>
          <Timeline>
            <TimelineItem icon={<Phone className="h-3 w-3" />} iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400">
              <TimelineContent>
                <TimelineTime>Hoje, 14:30</TimelineTime>
                <TimelineTitle>Ligação de Qualificação</TimelineTitle>
                <TimelineDescription>Conversa inicial com Carlos da Acme Corp sobre o novo projeto de infra.</TimelineDescription>
              </TimelineContent>
            </TimelineItem>
            
            <TimelineItem icon={<Mail className="h-3 w-3" />} iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
              <TimelineContent>
                <TimelineTime>Ontem, 09:15</TimelineTime>
                <TimelineTitle>Proposta Enviada</TimelineTitle>
                <TimelineDescription>Proposta técnica e comercial enviada para a diretoria da Tech Solutions.</TimelineDescription>
              </TimelineContent>
            </TimelineItem>

            <TimelineItem icon={<Calendar className="h-3 w-3" />} iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400">
              <TimelineContent>
                <TimelineTime>Segunda-feira, 11:00</TimelineTime>
                <TimelineTitle>Reunião de Follow-up</TimelineTitle>
                <TimelineDescription>Alinhamento de expectativas com a Global Services. Próximo passo: contrato.</TimelineDescription>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </div>

      </div>
    </div>
  );
}
