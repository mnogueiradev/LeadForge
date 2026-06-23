import * as React from 'react';
import { toast } from 'sonner';
import { useActivities } from '../api/use-activities';
import { format, isBefore, isAfter, subMinutes, addMinutes } from 'date-fns';

export function ActivityNotifier() {
  const { data: activitiesResponse } = useActivities({
    status: 'pending',
    limit: 100, // Look at the next 100 pending activities
  });

  const activities = activitiesResponse?.data || [];
  const notifiedIds = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    if (!activities.length) return;

    const interval = setInterval(() => {
      const now = new Date();
      
      activities.forEach((activity) => {
        // Skip if already notified
        if (notifiedIds.current.has(activity.id)) return;

        const dueDate = new Date(activity.dueDate);
        
        // Se a data/hora for agora (com margem de 1 minuto) e não foi notificado ainda
        // The condition: if dueDate <= now AND dueDate >= now - 5 minutes (to avoid alerting old overdue tasks every time)
        const fiveMinsAgo = subMinutes(now, 5);
        const inOneMin = addMinutes(now, 1);

        if (isBefore(dueDate, inOneMin) && isAfter(dueDate, fiveMinsAgo)) {
          toast.info(`Lembrete de Atividade: ${activity.title}`, {
            description: `Marcada para ${format(dueDate, 'HH:mm')}.`,
            duration: 10000,
          });
          notifiedIds.current.add(activity.id);
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [activities]);

  return null;
}
