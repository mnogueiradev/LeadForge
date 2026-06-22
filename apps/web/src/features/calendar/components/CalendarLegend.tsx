import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { getActivityHexColor } from '@/features/activities/utils/activity-colors';

export function CalendarLegend() {
  return (
    <div className="flex flex-col gap-2 mt-2 mb-6">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="font-semibold text-muted-foreground mr-1">Tipos:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: getActivityHexColor('meeting') }}></span>
          <span>Reunião</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: getActivityHexColor('call') }}></span>
          <span>Ligação</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: getActivityHexColor('whatsapp') }}></span>
          <span>WhatsApp</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: getActivityHexColor('email') }}></span>
          <span>Email</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: getActivityHexColor('follow_up') }}></span>
          <span>Follow-up</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: getActivityHexColor('task') }}></span>
          <span>Tarefa</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="font-semibold text-muted-foreground mr-1">Status:</span>
        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Pendente</Badge>
        <Badge variant="default" className="text-[10px] h-5 px-1.5 bg-emerald-600 hover:bg-emerald-600">Concluído</Badge>
        <Badge variant="destructive" className="text-[10px] h-5 px-1.5">Cancelado</Badge>
      </div>
    </div>
  );
}
