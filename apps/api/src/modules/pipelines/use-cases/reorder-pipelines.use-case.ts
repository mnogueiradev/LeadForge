import { Injectable, Inject } from '@nestjs/common';
import type { IPipelineRepository } from '../repositories/pipelines.repository.interface';
import { PIPELINE_REPOSITORY } from '../repositories/pipelines.repository.interface';
import { ReorderPipelinesDto } from '../dtos/reorder-pipelines.dto';

@Injectable()
export class ReorderPipelinesUseCase {
  constructor(
    @Inject(PIPELINE_REPOSITORY)
    private readonly pipelineRepository: IPipelineRepository,
  ) {}

  async execute(tenantId: string, dto: ReorderPipelinesDto) {
    for (const item of dto.pipelines) {
      await this.pipelineRepository.updateDisplayOrder(
        tenantId,
        item.id,
        item.displayOrder,
      );
    }
  }
}
