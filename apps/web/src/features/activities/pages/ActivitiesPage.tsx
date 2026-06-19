import * as React from 'react';
import { Search, Plus, Filter, Calendar, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Timeline, TimelineItem, TimelineContent, TimelineTitle, TimelineDescription, TimelineTime } from '@/components/ui/timeline';
import { Card, CardContent } from '@/components/ui/card';

const activities = [
  { id: '1', type: 'call', title: 'Ligação de Qualificação', description: 'Conversa inicial com Carlos da Acme Corp sobre o novo projeto de infra.', date: 'Hoje, 14:30', status: 'completed', contact: 'Carlos Admin' },
  { id: '2', type: 'meeting', title: 'Reunião de Follow-up', description: 'Alinhamento de expectativas com a Global Services. Próximo passo: contrato.', date: 'Hoje, 11:00', status: 'completed', contact: 'Ana Silva' },
  { id: '3', type: 'email', title: 'Proposta Enviada', description: 'Proposta técnica e comercial enviada para a diretoria da Tech Solutions.', date: 'Ontem, 09:15', status: 'completed', contact: 'Pedro Costa' },
  { id: '4', type: 'task', title: 'Revisar Contrato', description: 'Revisar as cláusulas de SLA do contrato da InovaTech.', date: 'Amanhã, 10:00', status: 'pending', contact: 'Interno' },
  { id: '5', type: 'call', title: 'Ligar para Prospect', description: 'Retornar ligação de Alpha Indústria para apresentar case de sucesso.', date: 'Amanhã, 15:30', status: 'pending', contact: 'Lucas Oliveira' },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'call': return <Phone className="h-4 w-4" />;
    case 'meeting': return <Calendar className="h-4 w-4" />;
    case 'email': return <Mail className="h-4 w-4" />;
    case 'task': return <FileText className="h-4 w-4" />;
    default: return <CheckCircle2 className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'call': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400';
    case 'meeting': return 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400';
    case 'email': return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400';
    case 'task': return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400';
    default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
};

export function ActivitiesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atividades</h1>
          <p className="text-muted-foreground mt-1">Seu histórico e próximas tarefas de relacionamento.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Nova Atividade
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar atividades, contatos ou empresas..." className="pl-8" />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>

      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-6">
          <Timeline>
            {activities.map((activity) => (
              <TimelineItem 
                key={activity.id} 
                icon={getTypeIcon(activity.type)} 
                iconClassName={getTypeColor(activity.type)}
                className="pb-4"
              >
                <TimelineContent>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <TimelineTime>{activity.date}</TimelineTime>
                    <Badge variant={activity.status === 'completed' ? 'secondary' : 'default'} className="w-fit">
                      {activity.status === 'completed' ? 'Concluído' : 'Pendente'}
                    </Badge>
                  </div>
                  <TimelineTitle className="text-base">{activity.title}</TimelineTitle>
                  <TimelineDescription className="mt-1">{activity.description}</TimelineDescription>
                  <div className="mt-2 text-xs font-medium text-muted-foreground bg-muted w-fit px-2 py-1 rounded">
                    Com: {activity.contact}
                  </div>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </CardContent>
      </Card>
    </div>
  );
}
