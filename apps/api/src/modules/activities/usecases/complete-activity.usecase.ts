import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, ActivityStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CompleteActivityUseCase {
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

    if (activity.status === ActivityStatus.COMPLETED) {
      return activity; // Idempotent
    }

    if (activity.status === ActivityStatus.CANCELED) {
      throw new BadRequestException('Cannot complete a canceled activity');
    }

    const updatedActivity = await this.prisma.activity.update({
      where: { id: activity.id },
      data: {
        status: ActivityStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    this.eventEmitter.emit('activity.completed', {
      activity: updatedActivity,
      userId,
    });

    this.eventEmitter.emit('timeline.event.activity_completed', {
      tenantId,
      eventType: 'ACTIVITY_COMPLETED',
      entityType: 'ACTIVITY',
      entityId: activity.id,
      userId,
      data: {
        type: activity.type,
        title: activity.title,
        completedAt: updatedActivity.completedAt,
      },
    });

    return updatedActivity;
  }
}
