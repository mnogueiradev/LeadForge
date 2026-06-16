import { Injectable, Inject } from '@nestjs/common';
import { ITagRepository } from '../repositories/tags.repository.interface';
import { Tag } from '@prisma/client';

@Injectable()
export class ListTagsUseCase {
  constructor(
    @Inject(ITagRepository) private readonly tagRepository: ITagRepository,
  ) {}

  async execute(
    tenantId: string,
    includeInactive: boolean = false,
  ): Promise<Tag[]> {
    return this.tagRepository.findMany(tenantId, includeInactive);
  }
}
