import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPipelineRepository } from '../repositories/pipelines.repository.interface';
import { PIPELINE_REPOSITORY } from '../repositories/pipelines.repository.interface';
import { UpdatePipelineDto } from '../dtos/update-pipeline.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PipelineUpdatedEvent } from '../events/pipeline.events';

@Injectable()
export class UpdatePipelineUseCase {
  constructor(
    @Inject(PIPELINE_REPOSITORY)
    private readonly pipelineRepository: IPipelineRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    id: string,
    userId: string,
    dto: UpdatePipelineDto,
  ) {
    const pipeline = await this.pipelineRepository.findById(tenantId, id);
    if (!pipeline) {
      throw new NotFoundException('Pipeline não encontrado');
    }

    const updated = await this.pipelineRepository.update(tenantId, id, dto);

    this.eventEmitter.emit(
      'pipeline.updated',
      new PipelineUpdatedEvent(tenantId, updated, userId),
    );

    return updated;
  }
}
