import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, ActivityStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateActivityDto } from '../dto/update-activity.dto';

@Injectable()
export class UpdateActivityUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    activityId: string,
    userId: string,
    dto: UpdateActivityDto,
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
        'Cannot update a completed or canceled activity',
      );
    }

    // Re-evaluate overdue status if dueDate changes
    let newStatus = activity.status;
    if (
      dto.dueDate &&
      new Date(dto.dueDate) < new Date() &&
      activity.status === ActivityStatus.PENDING
    ) {
      newStatus = ActivityStatus.OVERDUE;
    } else if (
      dto.dueDate &&
      new Date(dto.dueDate) >= new Date() &&
      activity.status === ActivityStatus.OVERDUE
    ) {
      newStatus = ActivityStatus.PENDING;
    }

    const updatedActivity = await this.prisma.activity.update({
      where: { id: activity.id },
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        durationMinutes: dto.durationMinutes,
        location: dto.location,
        metadata: dto.metadata,
        status: newStatus,
      },
    });

    this.eventEmitter.emit('activity.updated', {
      activity: updatedActivity,
      userId,
    });

    return updatedActivity;
  }
}
