import * as React from 'react';
import { Activity } from '@/features/activities/api/use-activities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isToday, isThisWeek, isThisMonth } from 'date-fns';
import { CheckCircle2, TrendingUp, CalendarDays, Clock } from 'lucide-react';

interface ProductivityDashboardProps {
  activities: Activity[];
}

export function ProductivityDashboard({ activities }: ProductivityDashboardProps) {
  const today = new Date();

  // Filtros de tempo
  const activitiesToday = activities.filter(a => a.dueDate && isToday(new Date(a.dueDate)));
  const activitiesThisWeek = activities.filter(a => a.dueDate && isThisWeek(new Date(a.dueDate), { weekStartsOn: 1 }));
  const activitiesThisMonth = activities.filter(a => a.dueDate && isThisMonth(new Date(a.dueDate)));

  // Cálculos Hoje
  const completedToday = activitiesToday.filter(a => a.status === 'completed');
  const totalToday = activitiesToday.length;
  const completionRateToday = totalToday > 0 ? Math.round((completedToday.length / totalToday) * 100) : 0;

  // Cálculos Semana
  const completedThisWeek = activitiesThisWeek.filter(a => a.status === 'completed');
  const totalThisWeek = activitiesThisWeek.length;
  const completionRateWeek = totalThisWeek > 0 ? Math.round((completedThisWeek.length / totalThisWeek) * 100) : 0;

  // Cálculo de Horas Gastas Hoje (Baseado na duração ou default 30min se concluído)
  const hoursSpentToday = completedToday.reduce((acc, act) => acc + (act.durationMinutes || 30), 0) / 60;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full p-4">
      <h2 className="text-2xl font-bold tracking-tight mb-2">Painel de Produtividade</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Concluídas Hoje */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas Hoje</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              de {totalToday} atividades planejadas
            </p>
          </CardContent>
        </Card>

        {/* Taxa de Conclusão Hoje */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desempenho Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRateToday}%</div>
            <div className="w-full bg-muted rounded-full mt-2 h-2 overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${completionRateToday}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Conclusão Semana */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desempenho na Semana</CardTitle>
            <CalendarDays className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRateWeek}%</div>
            <div className="w-full bg-muted rounded-full mt-2 h-2 overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${completionRateWeek}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {completedThisWeek.length} de {totalThisWeek} concluídas
            </p>
          </CardContent>
        </Card>

        {/* Tempo Investido Hoje */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Investido (Hoje)</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hoursSpentToday.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              Em atividades concluídas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Funil de Execução Diário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-[120px] text-sm font-medium">Total Planejado</div>
                <div className="flex-1">
                  <div className="bg-slate-100 dark:bg-slate-800 h-6 rounded-r-md relative flex items-center px-2" style={{ width: '100%' }}>
                    <span className="text-xs font-bold">{totalToday}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-[120px] text-sm font-medium">Pendentes</div>
                <div className="flex-1">
                  <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 h-6 rounded-r-md relative flex items-center px-2 transition-all" style={{ width: `${Math.max(10, ((totalToday - completedToday.length) / (totalToday || 1)) * 100)}%` }}>
                    <span className="text-xs font-bold">{totalToday - completedToday.length}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-[120px] text-sm font-medium">Concluídas</div>
                <div className="flex-1">
                  <div className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100 h-6 rounded-r-md relative flex items-center px-2 transition-all" style={{ width: `${Math.max(10, (completedToday.length / (totalToday || 1)) * 100)}%` }}>
                    <span className="text-xs font-bold">{completedToday.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
