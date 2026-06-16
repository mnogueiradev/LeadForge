import { TimelineEvent, TimelineEventType, EntityType } from '@prisma/client';

export interface CreateTimelineEventData {
  eventType: TimelineEventType;
  entityType: EntityType;
  entityId: string;
  actorUserId?: string;
  targetUserId?: string;
  title: string;
  description?: string;
  metadata?: any;
}

export interface TimelineFilters {
  entityType?: EntityType;
  entityId?: string;
  actorUserId?: string;
  eventType?: TimelineEventType;
}

export interface PaginatedTimeline {
  data: TimelineEvent[];
  nextCursor: string | null;
}

export interface ITimelineRepository {
  /**
   * Grava um evento de forma imutável (Append-only).
   */
  create(
    tenantId: string,
    data: CreateTimelineEventData,
  ): Promise<TimelineEvent>;

  /**
   * Retorna eventos utilizando Cursor Pagination.
   * Cursor é uma string de ID do evento.
   */
  findEvents(
    tenantId: string,
    filters: TimelineFilters,
    cursor?: string,
    limit?: number,
  ): Promise<PaginatedTimeline>;
}

export const TIMELINE_REPOSITORY = Symbol('TIMELINE_REPOSITORY');
