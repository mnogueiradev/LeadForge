import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ListCalendarEventsDto } from '../dto/list-calendar-events.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ListCalendarEventsUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(tenantId: string, dto: ListCalendarEventsDto) {
    const {
      search,
      eventType,
      status,
      ownerUserId,
      contactId,
      organizationId,
      leadId,
      dealId,
      page = 1,
      limit = 50,
    } = dto;

    const where: Prisma.CalendarEventWhereInput = {
      tenantId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (eventType) where.eventType = eventType;
    if (status) where.status = status;
    if (ownerUserId) where.ownerUserId = ownerUserId;
    if (contactId) where.contactId = contactId;
    if (organizationId) where.organizationId = organizationId;
    if (leadId) where.leadId = leadId;
    if (dealId) where.dealId = dealId;

    const skip = (page - 1) * limit;

    const [total, events] = await Promise.all([
      this.prisma.calendarEvent.count({ where }),
      this.prisma.calendarEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startAt: 'desc' },
        include: {
          ownerUser: { select: { id: true, firstName: true, lastName: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
          organization: { select: { id: true, name: true } },
          deal: { select: { id: true, title: true } },
        },
      }),
    ]);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
