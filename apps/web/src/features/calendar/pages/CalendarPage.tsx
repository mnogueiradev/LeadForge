import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin, { EventResizeDoneArg } from '@fullcalendar/interaction';
import { Plus, CalendarX2, Check, ArrowRight, ArrowRightCircle, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActivities, Activity, useUpdateActivity, useCompleteActivity } from '@/features/activities/api/use-activities';
import { getActivityHexColor } from '@/features/activities/utils/activity-colors';
import { CalendarFilters } from '../components/CalendarFilters';
import { CalendarIndicators } from '../components/CalendarIndicators';
import { TodayAgendaPanel } from '../components/TodayAgendaPanel';
import { OverdueActivitiesPanel } from '../components/OverdueActivitiesPanel';
import { SmartAgendaPanel } from '../components/SmartAgendaPanel';
import { ProductivityDashboard } from '../components/ProductivityDashboard';
import { CalendarLegend } from '../components/CalendarLegend';
import { ActivityDetailsDrawer } from '../components/ActivityDetailsDrawer';
import { ActivityFormModal } from '../components/ActivityFormModal';
import { DatesSetArg, EventClickArg, EventDropArg, EventContentArg } from '@fullcalendar/core';
import { toast } from 'sonner';
import { format, addDays, addWeeks, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useSyncedFilters } from '../../activities/store/activityFiltersStore';
import { usePermissions } from '@/hooks/usePermissions';

export function CalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useSyncedFilters(searchParams, setSearchParams);
  const calendarRef = React.useRef<FullCalendar>(null);
  
  const { hasPermission } = usePermissions();
  const canWrite = hasPermission('activities.write'); 
  
  const [dateRange, setDateRange] = React.useState<{ start: string; end: string } | null>(null);
  const [selectedActivity, setSelectedActivity] = React.useState<Activity | null>(null);
  
  // Modal & Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<'create' | 'edit'>('create');
  const [initialDate, setInitialDate] = React.useState<string | undefined>();
  const [initialTime, setInitialTime] = React.useState<string | undefined>();

  const updateActivity = useUpdateActivity();
  const completeActivity = useCompleteActivity();

  React.useEffect(() => {
    filters.initializeFromURL(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once to load initial url into Zustand

  // Filtros
  const view = searchParams.get('view') || 'dayGridMonth';
  const type = filters.type || undefined;
  const status = filters.status || undefined;
  const ownerUserId = filters.ownerUserId || undefined;
  const organizationId = filters.organizationId || undefined;
  const contactId = filters.contactId || undefined;
  const pipelineId = filters.pipelineId || undefined;
  const stageId = filters.stageId || undefined;
  const searchTerm = (filters.search || '').toLowerCase();

  const { data: activitiesResponse, isLoading, isError } = useActivities({
    fromDate: dateRange?.start,
    toDate: dateRange?.end,
    type: type as any,
    status: status as any,
    ownerUserId,
    organizationId,
    contactId,
    pipelineId,
    stageId,
    limit: 1000
  });

  const rawActivities = activitiesResponse?.data || [];

  // Busca global em memória
  const activities = React.useMemo(() => {
    if (!searchTerm) return rawActivities;
    return rawActivities.filter(a => {
      return (
        a.title.toLowerCase().includes(searchTerm) ||
        a.organization?.name.toLowerCase().includes(searchTerm) ||
        `${a.contact?.firstName} ${a.contact?.lastName}`.toLowerCase().includes(searchTerm) ||
        a.deal?.title.toLowerCase().includes(searchTerm)
      );
    });
  }, [rawActivities, searchTerm]);

  // Mapeamento das atividades para o FullCalendar
  const calendarEvents = React.useMemo(() => {
    return activities.map((activity) => {
      const isEditable = canWrite && activity.status === 'pending';
      let end: string | undefined = undefined;

      if (activity.durationMinutes) {
        const startDate = new Date(activity.dueDate);
        const endDate = new Date(startDate.getTime() + activity.durationMinutes * 60000);
        end = endDate.toISOString();
      }

      return {
        id: activity.id,
        title: activity.title,
        start: activity.dueDate,
        end,
        extendedProps: { activity },
        backgroundColor: getActivityHexColor(activity.type),
        borderColor: getActivityHexColor(activity.type),
        editable: isEditable,
        startEditable: isEditable,
        durationEditable: isEditable,
      };
    });
  }, [activities, canWrite]);

  // Ações Rápidas via Tooltip/Dropdown
  const handleQuickComplete = async (activity: Activity, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canWrite) return;
    try {
      await completeActivity.mutateAsync(activity.id);
      toast.success('Atividade concluída com sucesso!');
    } catch {
      toast.error('Erro ao concluir atividade');
    }
  };

  const handleQuickReschedule = async (activity: Activity, days: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canWrite) return;
    try {
      const newDate = addDays(new Date(activity.dueDate), days);
      await updateActivity.mutateAsync({
        id: activity.id,
        data: { dueDate: newDate.toISOString() }
      });
      toast.success(`Reagendada para ${format(newDate, "dd/MM")}`);
    } catch {
      toast.error('Erro ao reagendar');
    }
  };

  // Navegação Temporal Rápida
  const navigateTo = (date: Date) => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.gotoDate(date);
    }
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    if (searchParams.get('view') !== arg.view.type) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('view', arg.view.type);
        return newParams;
      }, { replace: true });
    }

    setDateRange({
      start: arg.startStr,
      end: arg.endStr,
    });
  };

  const handleEventClick = (arg: EventClickArg) => {
    const activity = arg.event.extendedProps.activity as Activity;
    setSelectedActivity(activity);
    setIsDrawerOpen(true);
  };

  const handleDateClick = (arg: any) => {
    if (!canWrite) return;
    setInitialDate(arg.dateStr.split('T')[0]);
    setInitialTime(arg.dateStr.split('T')[1]?.substring(0, 5) || undefined);
    setSelectedActivity(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleSelect = (arg: any) => {
    if (!canWrite) return;
    setInitialDate(arg.startStr.split('T')[0]);
    setInitialTime(arg.startStr.split('T')[1]?.substring(0, 5) || undefined);
    setSelectedActivity(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEventDrop = async (arg: EventDropArg) => {
    if (!canWrite) {
      arg.revert();
      return;
    }
    const activity = arg.event.extendedProps.activity as Activity;
    if (activity.status === 'completed' || activity.status === 'canceled') {
      arg.revert();
      toast.error('Não é possível reagendar atividades concluídas ou canceladas');
      return;
    }
    
    const newStart = arg.event.start;
    if (!newStart) {
      arg.revert();
      return;
    }

    try {
      await updateActivity.mutateAsync({
        id: activity.id,
        data: { dueDate: newStart.toISOString() }
      });
      toast.success('Atividade reagendada com sucesso');
    } catch {
      arg.revert();
      toast.error('Erro ao reagendar atividade');
    }
  };

  const handleEventResize = async (arg: EventResizeDoneArg) => {
    if (!canWrite) {
      arg.revert();
      return;
    }
    const activity = arg.event.extendedProps.activity as Activity;
    if (activity.status === 'completed' || activity.status === 'canceled') {
      arg.revert();
      toast.error('Não é possível alterar a duração de atividades concluídas ou canceladas');
      return;
    }
    
    const newStart = arg.event.start;
    const newEnd = arg.event.end;
    if (!newStart || !newEnd) {
      arg.revert();
      return;
    }

    const durationMinutes = Math.round((newEnd.getTime() - newStart.getTime()) / 60000);

    try {
      await updateActivity.mutateAsync({
        id: activity.id,
        data: {
          dueDate: newStart.toISOString(),
          durationMinutes,
        }
      });
      toast.success('Duração atualizada com sucesso');
    } catch {
      arg.revert();
      toast.error('Erro ao atualizar duração');
    }
  };

  const openCreateModal = () => {
    setSelectedActivity(null);
    setInitialDate(undefined);
    setInitialTime(undefined);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = (activity: Activity) => {
    setIsDrawerOpen(false);
    setSelectedActivity(activity);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Renderizador de conteúdo do evento com Tooltip e Quick Actions
  const renderEventContent = (arg: EventContentArg) => {
    const activity = arg.event.extendedProps.activity as Activity;
    const timeText = arg.timeText;
    const isPending = activity.status === 'pending';

    // No modo "list", o layout do FullCalendar é diferente (tabela). 
    // Faremos o dropdown só em modos Grid se desejado, mas o Tooltip funciona bem.
    const isList = arg.view.type === 'listWeek' || arg.view.type === 'listMonth';

    const content = (
      <div className={`w-full h-full truncate px-1.5 py-0.5 text-xs flex justify-between items-center group ${isList ? 'py-1' : ''}`}>
        <div className="truncate flex-1">
          {timeText && <span className="font-semibold mr-1">{timeText}</span>}
          {activity.title}
        </div>
        {isPending && !isList && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="opacity-0 group-hover:opacity-100 hover:bg-black/10 rounded-sm p-0.5 transition-opacity" onClick={e => e.stopPropagation()}>
                <MoreVertical className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 z-[100]">
              <DropdownMenuItem onClick={(e) => handleQuickComplete(activity, e as any)}>
                <Check className="mr-2 h-4 w-4 text-emerald-600" />
                <span>Marcar como Concluída</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => handleQuickReschedule(activity, 1, e as any)}>
                <ArrowRight className="mr-2 h-4 w-4" />
                <span>Adiar para Amanhã</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleQuickReschedule(activity, 7, e as any)}>
                <ArrowRightCircle className="mr-2 h-4 w-4" />
                <span>Adiar Próxima Semana</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedActivity(activity); setIsDrawerOpen(true); }}>
                <span>Abrir Detalhes</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );

    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="w-64 p-3 space-y-2 z-[110]">
            <p className="font-semibold text-sm leading-tight">{activity.title}</p>
            <div className="space-y-1 mt-2 text-xs text-muted-foreground">
              {activity.organization && (
                <p><span className="font-medium text-foreground">Empresa:</span> {activity.organization.name}</p>
              )}
              {activity.deal && (
                <>
                  <p><span className="font-medium text-foreground">Negócio:</span> {activity.deal.title}</p>
                  {activity.deal.stage && (
                    <p><span className="font-medium text-foreground">Etapa:</span> {activity.deal.stage.name}</p>
                  )}
                </>
              )}
              <p><span className="font-medium text-foreground">Horário:</span> {format(new Date(activity.dueDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            </div>
            
            {/* Quick actions direct on tooltip for easier access in list mode too */}
            {isPending && isList && (
              <div className="flex flex-col gap-1 mt-2 pt-2 border-t">
                <button 
                  className="flex items-center text-left hover:bg-muted p-1 rounded transition-colors text-emerald-600 font-medium"
                  onClick={(e) => handleQuickComplete(activity, e)}
                >
                  <Check className="h-3 w-3 mr-1" /> Concluir
                </button>
                <button 
                  className="flex items-center text-left hover:bg-muted p-1 rounded transition-colors"
                  onClick={(e) => handleQuickReschedule(activity, 1, e)}
                >
                  <ArrowRight className="h-3 w-3 mr-1" /> Adiar amanhã
                </button>
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] pb-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda Comercial</h1>
          <p className="text-muted-foreground mt-1">Sua central de gestão de reuniões e follow-ups.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Navegação Temporal Rápida */}
          <div className="hidden lg:flex items-center gap-1 bg-muted/50 p-1 rounded-lg mr-2 border">
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => navigateTo(new Date())}>Hoje</Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => navigateTo(addDays(new Date(), 1))}>Amanhã</Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => navigateTo(addWeeks(new Date(), 1))}>Próx Semana</Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => navigateTo(startOfMonth(new Date()))}>Este Mês</Button>
          </div>
          {canWrite && (
            <Button onClick={openCreateModal} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Agendar
            </Button>
          )}
        </div>
      </div>

      <TodayAgendaPanel activities={activities} />

      <Tabs defaultValue="calendar" className="flex-1 flex flex-col mt-4">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-muted/50 border">
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="smart">Agenda Inteligente</TabsTrigger>
            <TabsTrigger value="productivity">Produtividade</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="calendar" className="flex-1 flex flex-col xl:flex-row gap-6 m-0 p-0 border-0 outline-none focus-visible:ring-0">
          {/* Main Calendar Area */}
          <div className="flex-1 flex flex-col">
            <CalendarFilters />
            <CalendarLegend />

            <Card className="flex-1 rounded-xl shadow-sm border relative min-h-[600px]">
              <CardContent className="p-0 h-full flex flex-col [&_.fc]:flex-1 [&_.fc-theme-standard_.fc-scrollgrid]:border-x-0 [&_.fc-theme-standard_.fc-scrollgrid]:border-t-0 [&_.fc-button-primary]:bg-emerald-600 [&_.fc-button-primary]:border-emerald-600 [&_.fc-button-primary:hover]:bg-emerald-700 [&_.fc-button-primary:hover]:border-emerald-700 [&_.fc-button-primary:not(:disabled).fc-button-active]:bg-emerald-800 [&_.fc-button-primary:not(:disabled).fc-button-active]:border-emerald-800 [&_.fc-list-event-title]:py-2">
                
                {/* Loading State Skeleton */}
                {isLoading && !activitiesResponse && (
                  <div className="absolute inset-0 z-50 p-4 bg-background/80 backdrop-blur-sm flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-4">
                      <Skeleton className="h-10 w-32" />
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-10 w-48" />
                    </div>
                    <Skeleton className="flex-1 w-full" />
                  </div>
                )}

                {/* Error State */}
                {isError && (
                   <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/90 backdrop-blur-sm">
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <h2 className="text-xl font-bold mb-2 text-destructive">Erro ao carregar agenda</h2>
                        <p className="text-muted-foreground mb-4">Não foi possível buscar as atividades. Tente novamente mais tarde.</p>
                        <Button variant="outline" onClick={() => window.location.reload()}>Recarregar página</Button>
                      </div>
                   </div>
                )}

                {/* Calendário */}
                <div className="p-4 h-full flex flex-col relative">
                  <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    initialView={view}
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,listWeek'
                    }}
                    buttonText={{
                      listWeek: 'Agenda',
                      dayGridMonth: 'Mês',
                      timeGridWeek: 'Semana'
                    }}
                    events={calendarEvents}
                    datesSet={handleDatesSet}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    select={handleSelect}
                    eventDrop={handleEventDrop}
                    eventResize={handleEventResize}
                    eventContent={renderEventContent}
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    locale="pt-br"
                    slotMinTime="08:00:00"
                    slotMaxTime="20:00:00"
                    allDaySlot={false}
                    contentHeight="auto"
                    expandRows={true}
                    nowIndicator={true}
                    eventClassNames="cursor-pointer transition-transform hover:scale-[1.01]"
                    dayMaxEvents={true}
                  />

                  {/* Empty State Overlay for Grid Views */}
                  {!isLoading && calendarEvents.length === 0 && dateRange && (
                    <div className="absolute inset-0 top-[80px] z-30 flex items-center justify-center pointer-events-none">
                      <div className="flex flex-col items-center justify-center p-8 bg-card/95 backdrop-blur-sm rounded-xl border border-dashed shadow-sm pointer-events-auto text-center w-[300px]">
                        <CalendarX2 className="h-10 w-10 text-muted-foreground mb-4" />
                        <h2 className="text-lg font-bold mb-1">Nenhuma atividade</h2>
                        <p className="text-sm text-muted-foreground">
                          Nenhuma atividade encontrada neste período para os filtros selecionados.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="w-full xl:w-80 shrink-0 flex flex-col">
            <div className="flex flex-col gap-6">
              <CalendarIndicators activities={activities} />
              <OverdueActivitiesPanel 
                activities={activities} 
                onActivityClick={(activity) => {
                  setSelectedActivity(activity);
                  setIsDrawerOpen(true);
                }} 
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="smart" className="flex-1 m-0 p-0 border-0 outline-none focus-visible:ring-0">
          <SmartAgendaPanel 
            activities={activities}
            onActivityClick={(activity) => {
              setSelectedActivity(activity);
              setIsDrawerOpen(true);
            }} 
          />
        </TabsContent>

        <TabsContent value="productivity" className="flex-1 m-0 p-0 border-0 outline-none focus-visible:ring-0">
          <ProductivityDashboard activities={activities} />
        </TabsContent>
      </Tabs>

      <ActivityDetailsDrawer 
        activity={selectedActivity} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onEdit={openEditModal}
      />

      <ActivityFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        activity={selectedActivity}
        initialDate={initialDate}
        initialTime={initialTime}
      />
    </div>
  );
}
