import { Injectable, Inject } from '@nestjs/common';
import { ITagAssignmentRepository } from '../repositories/tags.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EntityType } from '@prisma/client';

@Injectable()
export class RemoveTagUseCase {
  constructor(
    @Inject(ITagAssignmentRepository)
    private readonly assignmentRepository: ITagAssignmentRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    userId: string,
    tagId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<void> {
    await this.assignmentRepository.remove(
      tenantId,
      tagId,
      entityType,
      entityId,
    );

    this.eventEmitter.emit('audit.log.created', {
      tenantId,
      userId,
      action: 'REMOVED',
      entityName: 'TAG_ASSIGNMENT',
      entityId: `${tagId}:${entityId}`,
      oldValues: { tagId, entityType, entityId },
    });

    this.eventEmitter.emit('timeline.event.created', {
      tenantId,
      entityType,
      entityId,
      action: 'TAG_REMOVED',
      actorId: userId,
      description: `Tag removida.`,
    });
  }
}
