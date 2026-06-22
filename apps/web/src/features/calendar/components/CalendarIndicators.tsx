import * as React from 'react';
import { Activity } from '@/features/activities/api/use-activities';
import { Card, CardContent } from '@/components/ui/card';
import { isToday, isPast } from 'date-fns';
import { CheckCircle2, AlertCircle, CalendarClock, Users, ArrowRightCircle, ListTodo } from 'lucide-react';

interface CalendarIndicatorsProps {
  activities: Activity[];
}

export function CalendarIndicators({ activities }: CalendarIndicatorsProps) {
  const stats = React.useMemo(() => {
    let hoje = 0;
    let atrasadas = 0;
    let concluidas = 0;
    let reunioes = 0;
    let followUps = 0;
    const total = activities.length;

    activities.forEach((activity) => {
      const date = new Date(activity.dueDate);
      
      if (isToday(date)) hoje++;
      
      if (activity.status === 'pending' && isPast(date) && !isToday(date)) {
        atrasadas++;
      }
      
      if (activity.status === 'completed') concluidas++;
      
      if (activity.type === 'meeting' && activity.status === 'pending') reunioes++;
      
      if (activity.type === 'follow_up' && activity.status === 'pending') followUps++;
    });

    return { hoje, atrasadas, concluidas, reunioes, followUps, total };
  }, [activities]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card>
        <CardContent className="p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase truncate">Total</span>
            <ListTodo className="h-4 w-4" />
          </div>
          <span className="text-2xl font-bold">{stats.total}</span>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-medium uppercase text-muted-foreground truncate">Hoje</span>
            <CalendarClock className="h-4 w-4" />
          </div>
          <span className="text-2xl font-bold">{stats.hoje}</span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between text-destructive">
            <span className="text-xs font-medium uppercase text-muted-foreground truncate">Atrasadas</span>
            <AlertCircle className="h-4 w-4" />
          </div>
          <span className="text-2xl font-bold">{stats.atrasadas}</span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-medium uppercase text-muted-foreground truncate">Concluídas</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span className="text-2xl font-bold">{stats.concluidas}</span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-xs font-medium uppercase text-muted-foreground truncate">Reuniões</span>
            <Users className="h-4 w-4" />
          </div>
          <span className="text-2xl font-bold">{stats.reunioes}</span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between text-orange-600">
            <span className="text-xs font-medium uppercase text-muted-foreground truncate">Follow-ups</span>
            <ArrowRightCircle className="h-4 w-4" />
          </div>
          <span className="text-2xl font-bold">{stats.followUps}</span>
        </CardContent>
      </Card>
    </div>
  );
}
