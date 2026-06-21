import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TIMELINE_REPOSITORY } from '../repositories/timeline.repository.interface';
import type { ITimelineRepository } from '../repositories/timeline.repository.interface';
import { TimelineEventType, EntityType } from '@prisma/client';

export interface TimelineEventPayload {
  tenantId: string;
  eventType: TimelineEventType;
  entityType: EntityType;
  entityId: string;
  userId?: string;
  targetUserId?: string;
  data?: any;
}

@Injectable()
export class TimelineEventHandler {
  private readonly logger = new Logger(TimelineEventHandler.name);

  constructor(
    @Inject(TIMELINE_REPOSITORY)
    private readonly timelineRepository: ITimelineRepository,
  ) {}

  @OnEvent('timeline.event.**', { async: true })
  async handleTimelineEvent(payload: TimelineEventPayload) {
    try {
      this.logger.log(
        `Receiving timeline event: ${payload.eventType || 'UNKNOWN'} for ${payload.entityType} ${payload.entityId}`,
      );

      if (!payload.eventType) {
        this.logger.warn(`Timeline event skipped: missing eventType for payload ${JSON.stringify(payload)}`);
        return;
      }

      const title = this.formatTitle(payload.eventType, payload.data);

      await this.timelineRepository.create(payload.tenantId, {
        eventType: payload.eventType,
        entityType: payload.entityType,
        entityId: payload.entityId,
        actorUserId: payload.userId,
        targetUserId: payload.targetUserId,
        title,
        metadata: payload.data,
      });
    } catch (error) {
      this.logger.error(
        `Failed to process timeline event ${payload.eventType}`,
        error,
      );
    }
  }

  private formatTitle(eventType: TimelineEventType, data: any): string {
    switch (eventType) {
      case 'CONTACT_CREATED':
        return `Contato criado${data?.name ? ': ' + data.name : ''}`;
      case 'CONTACT_UPDATED':
        return 'Contato atualizado';
      case 'ORGANIZATION_CREATED':
        return `Empresa criada${data?.name ? ': ' + data.name : ''}`;
      case 'ORGANIZATION_UPDATED':
        return 'Empresa atualizada';
      case 'NOTE_CREATED':
        return 'Anotação adicionada';
      case 'NOTE_DELETED':
        return 'Anotação excluída';
      case 'NOTE_PINNED':
        return 'Anotação fixada no topo';
      case 'NOTE_UNPINNED':
        return 'Anotação desfixada';
      case 'TAG_ASSIGNED':
        return `Tag vinculada${data?.tagName ? ': ' + data.tagName : ''}`;
      case 'TAG_REMOVED':
        return `Tag removida${data?.tagName ? ': ' + data.tagName : ''}`;

      case 'DEAL_CREATED':
        return `Oportunidade criada${data?.title ? ': ' + data.title : ''}`;
      case 'DEAL_UPDATED':
        return 'Oportunidade atualizada';
      case 'DEAL_MOVED':
        return 'Oportunidade movida de estágio';
      case 'DEAL_WON':
        return 'Oportunidade ganha (WON)';
      case 'DEAL_LOST':
        return 'Oportunidade perdida (LOST)';
      case 'DEAL_ARCHIVED':
        return 'Oportunidade arquivada';
      case 'DEAL_OWNER_CHANGED':
        return 'Responsável pela oportunidade alterado';

      default:
        return 'Atividade registrada';
    }
  }
}
