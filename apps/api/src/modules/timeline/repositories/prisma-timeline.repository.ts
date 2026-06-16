import { Injectable } from '@nestjs/common';
import { PrismaClient, TimelineEvent } from '@prisma/client';
import {
  ITimelineRepository,
  CreateTimelineEventData,
  TimelineFilters,
  PaginatedTimeline,
} from './timeline.repository.interface';

@Injectable()
export class PrismaTimelineRepository implements ITimelineRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    tenantId: string,
    data: CreateTimelineEventData,
  ): Promise<TimelineEvent> {
    return this.prisma.timelineEvent.create({
      data: {
        tenantId,
        ...data,
      },
    });
  }

  async findEvents(
    tenantId: string,
    filters: TimelineFilters,
    cursor?: string,
    limit: number = 20,
  ): Promise<PaginatedTimeline> {
    const where: any = { tenantId };

    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.actorUserId) where.actorUserId = filters.actorUserId;
    if (filters.eventType) where.eventType = filters.eventType;

    const findOptions: any = {
      where,
      take: limit + 1, // Pegamos 1 a mais para saber se há próxima página
      orderBy: { occurredAt: 'desc' },
      include: {
        actor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        target: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    };

    if (cursor) {
      findOptions.cursor = { id: cursor };
      // Quando fornecemos um cursor, o próprio registro do cursor é retornado no resultado (se incluírmos skip: 1, evitamos isso)
      findOptions.skip = 1;
    }

    const events = await this.prisma.timelineEvent.findMany(findOptions);

    let nextCursor: string | null = null;
    if (events.length > limit) {
      const nextItem = events.pop(); // Remove o limit+1
      nextCursor = nextItem!.id;
    }

    return {
      data: events,
      nextCursor,
    };
  }
}
