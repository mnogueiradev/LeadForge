import { Inject, Injectable } from '@nestjs/common';
import {
  TIMELINE_REPOSITORY,
  PaginatedTimeline,
} from '../repositories/timeline.repository.interface';
import type { ITimelineRepository } from '../repositories/timeline.repository.interface';
import { ListTimelineDto } from '../dtos/list-timeline.dto';

@Injectable()
export class ListTimelineUseCase {
  constructor(
    @Inject(TIMELINE_REPOSITORY)
    private readonly timelineRepository: ITimelineRepository,
  ) {}

  async execute(
    tenantId: string,
    dto: ListTimelineDto,
  ): Promise<PaginatedTimeline> {
    const filters = {
      entityType: dto.entityType,
      entityId: dto.entityId,
      actorUserId: dto.actorUserId,
      eventType: dto.eventType,
    };

    return this.timelineRepository.findEvents(
      tenantId,
      filters,
      dto.cursor,
      dto.limit,
    );
  }
}
