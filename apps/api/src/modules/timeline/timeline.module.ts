import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TIMELINE_REPOSITORY } from './repositories/timeline.repository.interface';
import { PrismaTimelineRepository } from './repositories/prisma-timeline.repository';
import { ListTimelineUseCase } from './use-cases/list-timeline.use-case';
import { TimelineEventHandler } from './handlers/timeline-event.handler';
import { TimelineController } from './timeline.controller';

@Module({
  controllers: [TimelineController],
  providers: [
    { provide: PrismaClient, useFactory: () => new PrismaClient({ log: ['error', 'warn'] }) },
    { provide: TIMELINE_REPOSITORY, useClass: PrismaTimelineRepository },
    ListTimelineUseCase,
    TimelineEventHandler
  ],
  exports: [TIMELINE_REPOSITORY],
})
export class TimelineModule {}
