import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateCalendarEventDto } from '../dto/create-calendar-event.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CreateCalendarEventUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    dto: CreateCalendarEventDto,
    createdByUserId: string,
  ) {
    if (new Date(dto.endAt) <= new Date(dto.startAt)) {
      throw new BadRequestException('endAt must be greater than startAt');
    }

    let { contactId, organizationId, leadId, dealId } = dto;

    if (dto.activityId) {
      const activity = await this.prisma.activity.findFirst({
        where: { id: dto.activityId, tenantId },
      });
      if (!activity) {
        throw new NotFoundException('Activity not found');
      }
      contactId = activity.contactId || contactId;
      organizationId = activity.organizationId || organizationId;
      leadId = activity.leadId || leadId;
      dealId = activity.dealId || dealId;
    }

    if (dealId && (!contactId || !organizationId)) {
      const deal = await this.prisma.deal.findFirst({
        where: { id: dealId, tenantId },
      });
      if (deal) {
        contactId = contactId || deal.contactId || undefined;
        organizationId = organizationId || deal.organizationId || undefined;
      }
    }

    if (leadId && (!contactId || !organizationId)) {
      const lead = await this.prisma.lead.findFirst({
        where: { id: leadId, tenantId },
      });
      if (lead) {
        contactId = contactId || lead.contactId || undefined;
        organizationId = organizationId || lead.organizationId || undefined;
      }
    }

    const event = await this.prisma.calendarEvent.create({
      data: {
        tenantId,
        ownerUserId: dto.ownerUserId,
        activityId: dto.activityId,
        title: dto.title,
        description: dto.description,
        eventType: dto.eventType,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        timezone: dto.timezone,
        location: dto.location,
        meetingUrl: dto.meetingUrl,
        isAllDay: dto.isAllDay,
        isRecurring: dto.isRecurring,
        recurrenceRule: dto.recurrenceRule,
        contactId,
        organizationId,
        leadId,
        dealId,
        metadata: dto.metadata !== undefined ? dto.metadata : undefined,
      },
      include: {
        ownerUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    this.eventEmitter.emit('calendar_event.created', {
      eventId: event.id,
      tenantId,
    });

    if (dealId) {
      this.eventEmitter.emit('timeline.event.calendar_event_created', {
        tenantId,
        dealId,
        actorUserId: createdByUserId,
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
