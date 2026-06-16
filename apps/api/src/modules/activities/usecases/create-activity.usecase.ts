import { Injectable } from '@nestjs/common';
import { PrismaClient, ActivityStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateActivityDto } from '../dto/create-activity.dto';

@Injectable()
export class CreateActivityUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    createdByUserId: string,
    dto: CreateActivityDto,
  ) {
    let { contactId, organizationId } = dto;

    // Propagate connections if Deal is provided
    if (dto.dealId && (!contactId || !organizationId)) {
      const deal = await this.prisma.deal.findFirst({
        where: { id: dto.dealId, tenantId },
        select: { contactId: true, organizationId: true },
      });
      if (deal) {
        contactId = contactId || deal.contactId || undefined;
        organizationId = organizationId || deal.organizationId || undefined;
      }
    }

    // Propagate connections if Lead is provided
    if (dto.leadId && (!contactId || !organizationId)) {
      const lead = await this.prisma.lead.findFirst({
        where: { id: dto.leadId, tenantId },
        select: { contactId: true, organizationId: true },
      });
      if (lead) {
        contactId = contactId || lead.contactId || undefined;
        organizationId = organizationId || lead.organizationId || undefined;
      }
    }

    // Calculate computed status if overdue initially
    let status: ActivityStatus = ActivityStatus.PENDING;
    if (dto.dueDate && new Date(dto.dueDate) < new Date()) {
      status = ActivityStatus.OVERDUE;
    }

    const activity = await this.prisma.activity.create({
      data: {
        tenantId,
        createdByUserId,
        ownerUserId: dto.ownerUserId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        durationMinutes: dto.durationMinutes,
        location: dto.location,
        metadata: dto.metadata,
        status,
        contactId,
        organizationId,
        leadId: dto.leadId,
        dealId: dto.dealId,
      },
    });

    // Publish Domain Event
    this.eventEmitter.emit('activity.created', {
      activity,
      userId: createdByUserId,
    });

    // Publish Timeline Event
    this.eventEmitter.emit('timeline.event.activity_created', {
      tenantId,
      eventType: 'ACTIVITY_CREATED',
      entityType: 'ACTIVITY',
      entityId: activity.id,
      userId: createdByUserId,
      data: {
        type: activity.type,
        title: activity.title,
        priority: activity.priority,
        dueDate: activity.dueDate,
        ownerUserId: activity.ownerUserId,
      },
    });

    return activity;
  }
}
