'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Clock, FileText, UserPlus, Phone, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';

type TimelineEvent = {
  id: string;
  eventType: string;
  title: string;
  description: string | null;
  createdAt: string;
  createdBy: { id: string; name: string } | null;
};

const getEventIcon = (type: string) => {
  switch (type) {
    case 'NOTE_ADDED': return <FileText className="h-4 w-4" />;
    case 'LEAD_CREATED': return <UserPlus className="h-4 w-4" />;
    case 'STATUS_CHANGED': return <Clock className="h-4 w-4" />;
    case 'MEETING_SCHEDULED': return <CalendarIcon className="h-4 w-4" />;
    case 'CALL_LOGGED': return <Phone className="h-4 w-4" />;
    case 'EMAIL_SENT': return <MessageSquare className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

export function LeadTimeline({ leadId }: { leadId: string }) {
  const { data: events, isLoading } = useQuery({
    queryKey: ['timeline', 'LEAD', leadId],
    queryFn: async () => {
      const response = await api.get(`/timeline/LEAD/${leadId}`);
      return response.data.data as TimelineEvent[];
    },
  });

  if (isLoading) {
    return <div>Carregando histórico...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Atividades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {events?.length === 0 && (
            <p className="text-muted-foreground">Nenhuma atividade registrada.</p>
          )}
          {events?.map((event) => (
            <div key={event.id} className="flex gap-4">
              <div className="mt-1 bg-muted p-2 rounded-full h-8 w-8 flex items-center justify-center">
                {getEventIcon(event.eventType)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{event.title}</p>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(event.createdAt), 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}
                {event.createdBy && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Por {event.createdBy.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
