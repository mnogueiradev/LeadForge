import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DeleteCalendarEventUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(tenantId: string, eventId: string) {
    const existing = await this.prisma.calendarEvent.findFirst({
      where: { id: eventId, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Calendar event not found');
    }

    await this.prisma.calendarEvent.update({
      where: { id: eventId },
      data: { deletedAt: new Date() },
    });
  }
}
