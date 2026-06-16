import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { GetCalendarAgendaDto } from '../dto/get-calendar-agenda.dto';

@Injectable()
export class GetCalendarAgendaUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(tenantId: string, dto: GetCalendarAgendaDto) {
    const rangeStart = new Date(dto.rangeStart);
    const rangeEnd = new Date(dto.rangeEnd);

    const where: any = {
      tenantId,
      deletedAt: null,
      startAt: { lte: rangeEnd },
      endAt: { gte: rangeStart },
    };

    if (dto.ownerUserId) {
      where.ownerUserId = dto.ownerUserId;
    }

    const events = await this.prisma.calendarEvent.findMany({
      where,
      orderBy: { startAt: 'asc' },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        organization: { select: { id: true, name: true } },
        deal: { select: { id: true, title: true } },
      },
    });

    return events;
  }
}
