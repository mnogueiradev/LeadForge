import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateCalendarEventDto } from '../dto/update-calendar-event.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UpdateCalendarEventUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    eventId: string,
    dto: UpdateCalendarEventDto,
    updatedByUserId: string,
  ) {
    const existing = await this.prisma.calendarEvent.findFirst({
      where: { id: eventId, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Calendar event not found');
    }

    if (existing.status === 'COMPLETED' || existing.status === 'CANCELED') {
      throw new BadRequestException(
        'Cannot update a completed or canceled event',
      );
    }

    if (
      dto.startAt &&
      dto.endAt &&
      new Date(dto.endAt) <= new Date(dto.startAt)
    ) {
      throw new BadRequestException('endAt must be greater than startAt');
    } else if (
      dto.startAt &&
      !dto.endAt &&
      new Date(existing.endAt) <= new Date(dto.startAt)
    ) {
      throw new BadRequestException('startAt must be before existing endAt');
    } else if (
      dto.endAt &&
      !dto.startAt &&
      new Date(dto.endAt) <= new Date(existing.startAt)
    ) {
      throw new BadRequestException('endAt must be after existing startAt');
    }

    const event = await this.prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        title: dto.title,
        description: dto.description,
        eventType: dto.eventType,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
        timezone: dto.timezone,
        location: dto.location,
        meetingUrl: dto.meetingUrl,
        isAllDay: dto.isAllDay,
        isRecurring: dto.isRecurring,
        recurrenceRule: dto.recurrenceRule,
        contactId: dto.contactId,
        organizationId: dto.organizationId,
        leadId: dto.leadId,
        dealId: dto.dealId,
        metadata: dto.metadata !== undefined ? dto.metadata : undefined,
      },
    });

    this.eventEmitter.emit('calendar_event.updated', {
      eventId: event.id,
      tenantId,
    });

    return event;
  }
}
