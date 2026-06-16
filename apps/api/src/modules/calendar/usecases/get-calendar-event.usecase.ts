import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CalendarEventResponseDto } from '../dto/calendar-event-response.dto';

@Injectable()
export class GetCalendarEventUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(
    tenantId: string,
    eventId: string,
  ): Promise<CalendarEventResponseDto> {
    const event = await this.prisma.calendarEvent.findFirst({
      where: { id: eventId, tenantId, deletedAt: null },
      include: {
        ownerUser: { select: { id: true, firstName: true, lastName: true } },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            primaryEmail: true,
          },
        },
        organization: { select: { id: true, name: true } },
        lead: { select: { id: true, title: true } },
        deal: { select: { id: true, title: true, value: true } },
        activity: { select: { id: true, title: true, status: true } },
      },
    });

    if (!event) {
      throw new NotFoundException('Calendar event not found');
    }

    return event;
  }
}
