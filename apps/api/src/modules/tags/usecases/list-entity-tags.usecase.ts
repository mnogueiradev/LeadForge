import { Injectable, Inject } from '@nestjs/common';
import { ITagAssignmentRepository } from '../repositories/tags.repository.interface';
import { Tag, EntityType } from '@prisma/client';

@Injectable()
export class ListEntityTagsUseCase {
  constructor(
    @Inject(ITagAssignmentRepository)
    private readonly assignmentRepository: ITagAssignmentRepository,
  ) {}

  async execute(
    tenantId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<Tag[]> {
    const assignments = await this.assignmentRepository.findByEntity(
      tenantId,
      entityType,
      entityId,
    );
    return assignments.map((a) => a.tag);
  }
}
