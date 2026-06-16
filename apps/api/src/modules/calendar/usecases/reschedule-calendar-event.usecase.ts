import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RescheduleCalendarEventDto } from '../dto/reschedule-calendar-event.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RescheduleCalendarEventUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    eventId: string,
    dto: RescheduleCalendarEventDto,
    actorUserId: string,
  ) {
    const existing = await this.prisma.calendarEvent.findFirst({
      where: { id: eventId, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Calendar event not found');
    }

    if (existing.status === 'COMPLETED' || existing.status === 'CANCELED') {
      throw new BadRequestException(
        'Cannot reschedule a completed or canceled event',
      );
    }

    if (new Date(dto.endAt) <= new Date(dto.startAt)) {
      throw new BadRequestException('endAt must be greater than startAt');
    }

    const event = await this.prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        timezone: dto.timezone,
      },
    });

    this.eventEmitter.emit('calendar_event.rescheduled', {
      eventId: event.id,
      tenantId,
    });

    if (event.dealId) {
      this.eventEmitter.emit('timeline.event.calendar_event_rescheduled', {
        tenantId,
        dealId: event.dealId,
        actorUserId,
        metadata: {
          eventId: event.id,
          title: event.title,
          startAt: event.startAt,
        },
      });
    }

    return event;
  }
}
