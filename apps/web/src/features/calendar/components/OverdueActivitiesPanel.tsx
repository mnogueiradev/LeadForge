import * as React from 'react';
import { Activity } from '@/features/activities/api/use-activities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isPast, isToday, differenceInDays } from 'date-fns';
import { AlertCircle, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OverdueActivitiesPanelProps {
  activities: Activity[];
  onActivityClick: (activity: Activity) => void;
}

export function OverdueActivitiesPanel({ activities, onActivityClick }: OverdueActivitiesPanelProps) {
  const overdueActivities = React.useMemo(() => {
    return activities
      .filter((activity) => {
        const date = new Date(activity.dueDate);
        return activity.status === 'pending' && isPast(date) && !isToday(date);
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()); // Mais antigas primeiro
  }, [activities]);

  if (overdueActivities.length === 0) {
    return null; // Oculta o painel se não houver atividades atrasadas
  }

  return (
    <Card className="flex flex-col h-[400px] border-destructive/20">
      <CardHeader className="bg-destructive/5 pb-3">
        <CardTitle className="text-sm font-bold flex items-center justify-between text-destructive">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Atividades Vencidas
          </span>
          <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
            {overdueActivities.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex flex-col">
            {overdueActivities.map((activity) => {
              const daysOverdue = differenceInDays(new Date(), new Date(activity.dueDate));
              
              return (
                <div 
                  key={activity.id}
                  className="p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onActivityClick(activity)}
                >
                  <p className="font-semibold text-sm truncate" title={activity.title}>{activity.title}</p>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {activity.organization?.name || activity.contact?.firstName || 'Sem Empresa'}
                    </p>
                    <div className="flex items-center gap-1 text-xs font-medium text-destructive">
                      <Clock className="h-3 w-3" />
                      <span>{daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'}</span>
                    </div>
                  </div>
                  
                  {activity.ownerUser && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Resp: {activity.ownerUser.firstName}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
