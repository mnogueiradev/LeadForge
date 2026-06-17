'use client';

import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type CalendarEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: string;
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: events, isLoading } = useQuery({
    queryKey: ['calendarEvents', currentDate.toISOString()],
    queryFn: async () => {
      // Simplification: fetching all events for now
      // In a real app, we'd pass start/end dates from FullCalendar
      const response = await api.get('/calendar/events');
      return response.data.data as CalendarEvent[];
    },
  });

  const formattedEvents = events?.map(event => ({
    id: event.id,
    title: event.title,
    start: event.startTime,
    end: event.endTime,
    backgroundColor: event.type === 'MEETING' ? '#3b82f6' : '#8b5cf6',
  })) || [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Calendário</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agenda</CardTitle>
          <CardDescription>
            Gerencie seus compromissos, reuniões e lembretes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Carregando calendário...</div>
          ) : (
            <div className="h-[700px]">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={formattedEvents}
                height="100%"
                locale="pt-br"
                buttonText={{
                  today: 'Hoje',
                  month: 'Mês',
                  week: 'Semana',
                  day: 'Dia',
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
