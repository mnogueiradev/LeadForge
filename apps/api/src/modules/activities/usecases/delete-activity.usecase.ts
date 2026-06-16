import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DeleteActivityUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(tenantId: string, activityId: string, userId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, tenantId, deletedAt: null },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    const deletedActivity = await this.prisma.activity.update({
      where: { id: activity.id },
      data: { deletedAt: new Date() },
    });

    this.eventEmitter.emit('activity.deleted', {
      activity: deletedActivity,
      userId,
    });

    return { success: true };
  }
}
