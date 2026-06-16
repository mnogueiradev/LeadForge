import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, ActivityStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CancelActivityUseCase {
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

    if (activity.status === ActivityStatus.CANCELED) {
      return activity; // Idempotent
    }

    if (activity.status === ActivityStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed activity');
    }

    const updatedActivity = await this.prisma.activity.update({
      where: { id: activity.id },
      data: {
        status: ActivityStatus.CANCELED,
        canceledAt: new Date(),
      },
    });

    this.eventEmitter.emit('activity.canceled', {
      activity: updatedActivity,
      userId,
    });

    this.eventEmitter.emit('timeline.event.activity_canceled', {
      tenantId,
      eventType: 'ACTIVITY_CANCELED',
      entityType: 'ACTIVITY',
      entityId: activity.id,
      userId,
      data: {
        type: activity.type,
        title: activity.title,
        canceledAt: updatedActivity.canceledAt,
      },
    });

    return updatedActivity;
  }
}
