import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CancelCalendarEventUseCase {
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
      throw new BadRequestException('Cannot cancel a completed event');
    }
    if (existing.status === 'CANCELED') {
      throw new BadRequestException('Event is already canceled');
    }

    const event = await this.prisma.calendarEvent.update({
      where: { id: eventId },
      data: { status: 'CANCELED' },
    });

    this.eventEmitter.emit('calendar_event.canceled', {
      eventId: event.id,
      tenantId,
    });

    if (event.dealId) {
      this.eventEmitter.emit('timeline.event.calendar_event_canceled', {
        tenantId,
        dealId: event.dealId,
        actorUserId,
        metadata: { eventId: event.id, title: event.title },
      });
    }

    return event;
  }
}
