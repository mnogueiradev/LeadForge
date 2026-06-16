import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CompleteCalendarEventUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(tenantId: string, eventId: string, actorUserId: string) {
    const existing = await this.prisma.calendarEvent.findFirst({
      where: { id: eventId, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Calendar event not found');
    }

    if (existing.status === 'COMPLETED') {
      throw new BadRequestException('Event is already completed');
    }
    if (existing.status === 'CANCELED') {
      throw new BadRequestException('Cannot complete a canceled event');
    }

    const event = await this.prisma.$transaction(async (tx: any) => {
      const updatedEvent = await tx.calendarEvent.update({
        where: { id: eventId },
        data: { status: 'COMPLETED' },
      });

      if (updatedEvent.activityId) {
        const activity = await tx.activity.findFirst({
          where: { id: updatedEvent.activityId, tenantId },
        });
        if (
          activity &&
          activity.status !== 'COMPLETED' &&
          activity.status !== 'CANCELED'
        ) {
          await tx.activity.update({
            where: { id: activity.id },
            data: { status: 'COMPLETED', completedAt: new Date() },
          });
          this.eventEmitter.emit('activity.completed', {
            activityId: activity.id,
            tenantId,
          });
        }
      }

      return updatedEvent;
    });

    this.eventEmitter.emit('calendar_event.completed', {
      eventId: event.id,
      tenantId,
    });

    if (event.dealId) {
      this.eventEmitter.emit('timeline.event.calendar_event_completed', {
        tenantId,
        dealId: event.dealId,
        actorUserId,
        metadata: { eventId: event.id, title: event.title },
      });
    }

    return event;
  }
}
