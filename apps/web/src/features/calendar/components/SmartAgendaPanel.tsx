import * as React from 'react';
import { Activity } from '@/features/activities/api/use-activities';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { isBefore, isToday, isTomorrow, startOfDay } from 'date-fns';
import { CalendarX2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { getActivityHexColor } from '@/features/activities/utils/activity-colors';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

interface SmartAgendaPanelProps {
  activities: Activity[];
  onActivityClick: (activity: Activity) => void;
}

export function SmartAgendaPanel({ activities, onActivityClick }: SmartAgendaPanelProps) {
  const pendingActivities = activities.filter(a => a.status === 'pending');
  const now = startOfDay(new Date());

  const overdue = pendingActivities.filter(a => isBefore(new Date(a.dueDate), now));
  const today = pendingActivities.filter(a => isToday(new Date(a.dueDate)));
  const tomorrow = pendingActivities.filter(a => isTomorrow(new Date(a.dueDate)));

  const renderActivityList = (list: Activity[], emptyMessage: string) => {
    if (list.length === 0) {
      return (
        <div className="text-center p-4 border border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/50">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {list.map(activity => {
          const color = getActivityHexColor(activity.type);
          
          return (
            <div 
              key={activity.id}
              onClick={() => onActivityClick(activity)}
              className="group flex flex-col p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors shadow-sm"
              style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm line-clamp-1">{activity.title}</h4>
                <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap ml-2">
                  {new Date(activity.dueDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="flex flex-col gap-1 mt-auto">
                {activity.organization && (
                  <span className="text-xs text-muted-foreground truncate">🏢 {activity.organization.name}</span>
                )}
                {activity.deal && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate max-w-[140px]">
                      💰 {activity.deal.title}
                    </span>
                    {activity.deal.value && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500">
                        {formatCurrency(Number(activity.deal.value))}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Atrasadas */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-red-100 p-2 rounded-full dark:bg-red-900/30">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-semibold text-lg">Atrasadas</h3>
            <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full dark:bg-red-900/50 dark:text-red-300 ml-auto">
              {overdue.length}
            </span>
          </div>
          <div className="pr-4">
            {renderActivityList(overdue, 'Nenhuma atividade atrasada! 🎉')}
          </div>
        </div>

        {/* Hoje */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-emerald-100 p-2 rounded-full dark:bg-emerald-900/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-lg">Hoje</h3>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full dark:bg-emerald-900/50 dark:text-emerald-300 ml-auto">
              {today.length}
            </span>
          </div>
          <div className="pr-4">
            {renderActivityList(today, 'Nenhuma atividade para hoje.')}
          </div>
        </div>

        {/* Amanhã */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 p-2 rounded-full dark:bg-blue-900/30">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-lg">Amanhã</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full dark:bg-blue-900/50 dark:text-blue-300 ml-auto">
              {tomorrow.length}
            </span>
          </div>
          <div className="pr-4">
            {renderActivityList(tomorrow, 'Nenhuma atividade agendada para amanhã.')}
          </div>
        </div>
      </div>
    </div>
  );
}
