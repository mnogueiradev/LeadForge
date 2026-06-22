import * as React from 'react';
import { useDealTimeline } from '../api/use-deals';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DealTimelineProps {
  dealId: string;
}

export function DealTimeline({ dealId }: DealTimelineProps) {
  const { data, isLoading, error } = useDealTimeline(dealId);

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Carregando timeline...</div>;
  }

  if (error || !data) {
    return <div className="py-8 text-center text-destructive">Erro ao carregar timeline.</div>;
  }

  const events = data.data;

  if (events.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">Nenhuma movimentação registrada.</div>;
  }

  return (
    <div className="space-y-6 py-4">
      <div className="relative border-l border-muted-foreground/20 ml-3 space-y-6">
        {events.map((event) => {
          let title = 'Evento desconhecido';
          let description = '';
          
          switch (event.eventType) {
            case 'DEAL_CREATED':
              title = 'Negócio Criado';
              description = `Negócio "${event.data?.title || ''}" foi criado.`;
              break;
            case 'DEAL_UPDATED':
              title = 'Negócio Atualizado';
              description = 'Detalhes do negócio foram alterados.';
              break;
            case 'DEAL_STAGE_CHANGED':
              title = 'Mudança de Estágio';
              description = `Movido para o estágio ${event.data?.toStageId || 'desconhecido'}.`;
              break;
            case 'DEAL_WON':
              title = 'Negócio Ganho!';
              description = 'O negócio foi fechado com sucesso.';
              break;
            case 'DEAL_LOST':
              title = 'Negócio Perdido';
              description = `Motivo: ${event.data?.lostReason || 'Não informado'}.`;
              break;
            case 'DEAL_OWNER_CHANGED':
              title = 'Mudança de Responsável';
              description = 'O responsável pelo negócio foi alterado.';
              break;
            default:
              title = event.eventType;
              description = JSON.stringify(event.data);
          }

          return (
            <div key={event.id} className="relative pl-6">
              <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-background" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{title}</span>
                <span className="text-sm text-muted-foreground">{description}</span>
                <span className="text-xs text-muted-foreground/70 mt-1">
                  {format(new Date(event.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
