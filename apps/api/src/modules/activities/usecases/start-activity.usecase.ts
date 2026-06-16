import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, ActivityStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class StartActivityUseCase {
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

    if (activity.status === ActivityStatus.IN_PROGRESS) {
      return activity; // Idempotent
    }

    if (
      activity.status === ActivityStatus.COMPLETED ||
      activity.status === ActivityStatus.CANCELED
    ) {
      throw new BadRequestException(
        'Cannot start a completed or canceled activity',
      );
    }

    const updatedActivity = await this.prisma.activity.update({
      where: { id: activity.id },
      data: {
        status: ActivityStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });

    this.eventEmitter.emit('activity.started', {
      activity: updatedActivity,
      userId,
    });

    return updatedActivity;
  }
}
