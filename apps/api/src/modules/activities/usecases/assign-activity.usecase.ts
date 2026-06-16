import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, ActivityStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AssignActivityDto } from '../dto/assign-activity.dto';

@Injectable()
export class AssignActivityUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    activityId: string,
    userId: string,
    dto: AssignActivityDto,
  ) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, tenantId, deletedAt: null },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    if (
      activity.status === ActivityStatus.COMPLETED ||
      activity.status === ActivityStatus.CANCELED
    ) {
      throw new BadRequestException(
        'Cannot reassign a completed or canceled activity',
      );
    }

    const updatedActivity = await this.prisma.activity.update({
      where: { id: activity.id },
      data: {
        ownerUserId: dto.ownerUserId,
      },
    });

    this.eventEmitter.emit('activity.assigned', {
      activity: updatedActivity,
      userId,
      assignedTo: dto.ownerUserId,
    });

    this.eventEmitter.emit('timeline.event.activity_assigned', {
      tenantId,
      eventType: 'ACTIVITY_ASSIGNED',
      entityType: 'ACTIVITY',
      entityId: activity.id,
      userId,
      data: {
        previousOwnerId: activity.ownerUserId,
        newOwnerId: dto.ownerUserId,
      },
    });

    return updatedActivity;
  }
}
