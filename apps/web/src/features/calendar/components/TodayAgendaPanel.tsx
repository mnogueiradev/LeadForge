import * as React from 'react';
import { Activity } from '@/features/activities/api/use-activities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isToday, isPast } from 'date-fns';
import { CheckCircle2, AlertCircle, CalendarClock, Users, ArrowRightCircle, Phone } from 'lucide-react';

interface TodayAgendaPanelProps {
  activities: Activity[];
}

export function TodayAgendaPanel({ activities }: TodayAgendaPanelProps) {
  const stats = React.useMemo(() => {
    let pendentesHoje = 0;
    let reunioesHoje = 0;
    let ligacoesHoje = 0;
    let followUpsHoje = 0;
    let concluidasHoje = 0;

    activities.forEach((activity) => {
      const date = new Date(activity.dueDate);
      
      if (isToday(date)) {
        if (activity.status === 'completed') {
          concluidasHoje++;
        } else if (activity.status === 'pending') {
          pendentesHoje++;
          if (activity.type === 'meeting') reunioesHoje++;
          if (activity.type === 'call') ligacoesHoje++;
          if (activity.type === 'follow_up') followUpsHoje++;
        }
      }
    });

    return { pendentesHoje, reunioesHoje, ligacoesHoje, followUpsHoje, concluidasHoje };
  }, [activities]);

  return (
    <Card className="mb-6 bg-slate-50 dark:bg-slate-900/50 border-emerald-100 dark:border-emerald-900/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-emerald-600" />
          Minha Agenda Hoje
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{stats.pendentesHoje}</span>
            <span className="text-xs font-medium text-muted-foreground uppercase">Pendentes</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-purple-600 mb-1">
              <Users className="h-3 w-3" />
              <span className="text-2xl font-bold leading-none">{stats.reunioesHoje}</span>
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase">Reuniões</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-blue-600 mb-1">
              <Phone className="h-3 w-3" />
              <span className="text-2xl font-bold leading-none">{stats.ligacoesHoje}</span>
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase">Ligações</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-orange-600 mb-1">
              <ArrowRightCircle className="h-3 w-3" />
              <span className="text-2xl font-bold leading-none">{stats.followUpsHoje}</span>
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase">Follow-ups</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-green-600 mb-1">
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-2xl font-bold leading-none">{stats.concluidasHoje}</span>
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase">Concluídas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
