import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPipelineRepository } from '../repositories/pipelines.repository.interface';
import { PIPELINE_REPOSITORY } from '../repositories/pipelines.repository.interface';

@Injectable()
export class GetPipelineUseCase {
  constructor(
    @Inject(PIPELINE_REPOSITORY)
    private readonly pipelineRepository: IPipelineRepository,
  ) {}

  async execute(tenantId: string, id: string) {
    const pipeline = await this.pipelineRepository.findById(tenantId, id);
    if (!pipeline) {
      throw new NotFoundException('Pipeline não encontrado');
    }
    return pipeline;
  }
}
