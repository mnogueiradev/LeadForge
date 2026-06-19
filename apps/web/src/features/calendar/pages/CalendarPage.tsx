import * as React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const events = [
  { title: 'Reunião Tech Solutions', date: new Date().toISOString().split('T')[0] + 'T10:00:00', backgroundColor: '#10b981', borderColor: '#10b981' },
  { title: 'Almoço InovaTech', date: new Date().toISOString().split('T')[0] + 'T12:30:00', backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
  { title: 'Apresentação Global Services', date: new Date().toISOString().split('T')[0] + 'T15:00:00', backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
];

export function CalendarPage() {
  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
          <p className="text-muted-foreground mt-1">Visualize suas reuniões, ligações e compromissos agendados.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Agendar
        </Button>
      </div>

      <Card className="flex-1 overflow-hidden rounded-xl shadow-sm border">
        <CardContent className="p-0 h-full flex flex-col [&_.fc]:flex-1 [&_.fc-theme-standard_.fc-scrollgrid]:border-x-0 [&_.fc-theme-standard_.fc-scrollgrid]:border-t-0 [&_.fc-button-primary]:bg-emerald-600 [&_.fc-button-primary]:border-emerald-600 [&_.fc-button-primary:hover]:bg-emerald-700 [&_.fc-button-primary:hover]:border-emerald-700 [&_.fc-button-primary:not(:disabled).fc-button-active]:bg-emerald-800 [&_.fc-button-primary:not(:disabled).fc-button-active]:border-emerald-800">
          <div className="p-4 h-full flex flex-col">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={events}
              locale="pt-br"
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              allDaySlot={false}
              height="100%"
              expandRows={true}
              nowIndicator={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
