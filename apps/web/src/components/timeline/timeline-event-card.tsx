"use client";

import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  UserPlus, UserCog, Building, Tags, 
  StickyNote, Calendar, Activity, 
  MessageCircle, Pin, Trash2, Edit
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface TimelineEventData {
  id: string;
  eventType: string;
  entityType: string;
  entityId: string;
  title: string;
  description?: string;
  metadata?: any;
  occurredAt: string;
  actor?: {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
  };
}

interface TimelineEventCardProps {
  event: TimelineEventData;
  isLast?: boolean;
}

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'CONTACT_CREATED': return <UserPlus className="h-4 w-4 text-emerald-500" />;
    case 'CONTACT_UPDATED': return <UserCog className="h-4 w-4 text-blue-500" />;
    case 'ORGANIZATION_CREATED': return <Building className="h-4 w-4 text-emerald-500" />;
    case 'ORGANIZATION_UPDATED': return <Edit className="h-4 w-4 text-blue-500" />;
    case 'TAG_ASSIGNED': return <Tags className="h-4 w-4 text-purple-500" />;
    case 'TAG_REMOVED': return <Tags className="h-4 w-4 text-muted-foreground" />;
    case 'NOTE_CREATED': return <StickyNote className="h-4 w-4 text-amber-500" />;
    case 'NOTE_PINNED': return <Pin className="h-4 w-4 text-amber-500" />;
    case 'NOTE_DELETED': return <Trash2 className="h-4 w-4 text-red-500" />;
    case 'MESSAGE_SENT': return <MessageCircle className="h-4 w-4 text-blue-500" />;
    default: return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
};

const getEventBg = (eventType: string) => {
  if (eventType.includes('CREATED')) return 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50';
  if (eventType.includes('UPDATED')) return 'bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50';
  if (eventType.includes('NOTE')) return 'bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50';
  if (eventType.includes('TAG')) return 'bg-purple-50 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/50';
  return 'bg-card border-border';
};

export function TimelineEventCard({ event, isLast = false }: TimelineEventCardProps) {
  const dateStr = formatDistanceToNow(new Date(event.occurredAt), { addSuffix: true, locale: ptBR });
  const exactDate = format(new Date(event.occurredAt), "dd 'de' MMM 'às' HH:mm", { locale: ptBR });
  
  const actorName = event.actor 
    ? `${event.actor.firstName} ${event.actor.lastName || ''}`.trim() 
    : 'Sistema';
    
  const initials = event.actor ? actorName.substring(0, 2).toUpperCase() : 'SYS';

  return (
    <div className="relative pl-8 sm:pl-12 py-2 group">
      {/* Linha vertical conectora */}
      {!isLast && (
        <div className="absolute top-8 bottom-0 left-4 sm:left-6 w-px bg-border -translate-x-1/2 group-hover:bg-primary/20 transition-colors" />
      )}
      
      {/* Ponto / Ícone na timeline */}
      <div className="absolute top-4 left-4 sm:left-6 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full border-2 border-background bg-card flex items-center justify-center shadow-sm z-10">
        {getEventIcon(event.eventType)}
      </div>

      {/* Card de Conteúdo */}
      <div className={cn(
        "p-3 sm:p-4 rounded-lg border shadow-sm transition-all hover:shadow-md",
        getEventBg(event.eventType)
      )}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
          <div>
            <h4 className="text-sm font-medium leading-none">{event.title}</h4>
            {event.description && (
              <p className="text-sm text-muted-foreground mt-1.5">{event.description}</p>
            )}
          </div>
          <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap" title={exactDate}>
            <Calendar className="mr-1 h-3 w-3" />
            {dateStr}
          </div>
        </div>
        
        {/* Renderização de Metadata (se houver necessidade específica) */}
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <div className="mt-3 text-xs bg-background/50 dark:bg-background/20 rounded p-2 border border-border/50">
            <pre className="text-[10px] sm:text-xs overflow-x-auto text-muted-foreground">
              {JSON.stringify(event.metadata, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2">
          <Avatar className="h-5 w-5 border">
            <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            por <span className="font-medium text-foreground">{actorName}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
