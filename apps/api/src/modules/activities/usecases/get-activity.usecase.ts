import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class GetActivityUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(tenantId: string, activityId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, tenantId, deletedAt: null },
      include: {
        ownerUser: { select: { id: true, firstName: true, lastName: true } },
        createdByUser: {
          select: { id: true, firstName: true, lastName: true },
        },
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
      },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return activity;
  }
}
