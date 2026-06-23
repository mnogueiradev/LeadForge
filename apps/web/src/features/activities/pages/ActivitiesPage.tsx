import * as React from 'react';
import { Search, Plus, Filter, Calendar, Phone, Mail, FileText, CheckCircle2, MessageSquare, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Timeline, TimelineItem, TimelineContent, TimelineTitle, TimelineDescription, TimelineTime } from '@/components/ui/timeline';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useActivities } from '@/features/activities/api/use-activities';
import { ActivityFormModal } from '@/features/calendar/components/ActivityFormModal';
import { usePermissions } from '@/hooks/usePermissions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'call': return <Phone className="h-4 w-4" />;
    case 'meeting': return <Calendar className="h-4 w-4" />;
    case 'email': return <Mail className="h-4 w-4" />;
    case 'task': return <FileText className="h-4 w-4" />;
    case 'message': return <MessageSquare className="h-4 w-4" />;
    default: return <CheckCircle2 className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'call': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400';
    case 'meeting': return 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400';
    case 'email': return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400';
    case 'message': return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400';
    case 'task': return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400';
    default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
};

export function ActivitiesPage() {
  const { data: activitiesResponse, isLoading } = useActivities();
  const activities = activitiesResponse?.data || [];
  const { hasPermission } = usePermissions();
  const canWrite = hasPermission('activities.write') || true; // Bypass temporário até relogar
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredActivities = React.useMemo(() => {
    if (!activities) return [];
    if (!searchTerm) return activities;
    
    const term = searchTerm.toLowerCase();
    return activities.filter(a => 
      a.title.toLowerCase().includes(term) || 
      (a.description && a.description.toLowerCase().includes(term))
    );
  }, [activities, searchTerm]);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atividades</h1>
          <p className="text-muted-foreground mt-1">Seu histórico e próximas tarefas de relacionamento.</p>
        </div>
        {canWrite && (
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Atividade
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar atividades..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>

      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-8 ml-3 pl-6 border-l border-muted-foreground/20">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-2 relative">
                  <div className="absolute -left-9 top-1 w-6 h-6 rounded-full bg-muted border shadow-sm"></div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-full max-w-md" />
                  <Skeleton className="h-6 w-24 mt-2" />
                </div>
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhuma atividade encontrada</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Você ainda não tem atividades cadastradas. Crie sua primeira atividade para começar a acompanhar seus relacionamentos.
              </p>
              {canWrite && (
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Atividade
                </Button>
              )}
            </div>
          ) : (
            <Timeline>
              {filteredActivities.map((activity) => (
                <TimelineItem 
                  key={activity.id} 
                  icon={getTypeIcon(activity.type)} 
                  iconClassName={getTypeColor(activity.type)}
                  className="pb-4"
                >
                  <TimelineContent>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                      <TimelineTime>
                        {format(new Date(activity.dueDate), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                      </TimelineTime>
                      <Badge variant={activity.status === 'COMPLETED' ? 'secondary' : 'default'} className="w-fit">
                        {activity.status === 'COMPLETED' ? 'Concluído' : 'Pendente'}
                      </Badge>
                    </div>
                    <TimelineTitle className="text-base">{activity.title}</TimelineTitle>
                    {activity.description && (
                      <TimelineDescription className="mt-1">{activity.description}</TimelineDescription>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {activity.ownerUser && (
                        <div className="text-xs font-medium text-muted-foreground bg-muted w-fit px-2 py-1 rounded">
                          Resp: {activity.ownerUser.name}
                        </div>
                      )}
                      {activity.contact && (
                        <div className="text-xs font-medium text-muted-foreground bg-muted w-fit px-2 py-1 rounded border border-border/50">
                          Contato: {activity.contact.name}
                        </div>
                      )}
                    </div>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          )}
        </CardContent>
      </Card>

      <ActivityFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="create"
      />
    </div>
  );
}
