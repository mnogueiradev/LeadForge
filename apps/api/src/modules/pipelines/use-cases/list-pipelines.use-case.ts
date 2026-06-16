import { Injectable, Inject } from '@nestjs/common';
import type { IPipelineRepository } from '../repositories/pipelines.repository.interface';
import { PIPELINE_REPOSITORY } from '../repositories/pipelines.repository.interface';
import { ListPipelinesDto } from '../dtos/list-pipelines.dto';

@Injectable()
export class ListPipelinesUseCase {
  constructor(
    @Inject(PIPELINE_REPOSITORY)
    private readonly pipelineRepository: IPipelineRepository,
  ) {}

  async execute(tenantId: string, dto: ListPipelinesDto) {
    const [items, total] = await this.pipelineRepository.findAll(tenantId, {
      skip: dto.skip,
      take: dto.take,
      includeArchived: dto.includeArchived,
      isActive: dto.isActive,
      search: dto.search,
    });

    return {
      items,
      total,
      skip: dto.skip || 0,
      take: dto.take || items.length,
    };
  }
}
