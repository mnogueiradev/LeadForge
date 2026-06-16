import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPipelineRepository } from '../repositories/pipelines.repository.interface';
import { PIPELINE_REPOSITORY } from '../repositories/pipelines.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PipelineDeactivatedEvent } from '../events/pipeline.events';

@Injectable()
export class DeactivatePipelineUseCase {
  constructor(
    @Inject(PIPELINE_REPOSITORY)
    private readonly pipelineRepository: IPipelineRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(tenantId: string, id: string, userId: string) {
    const pipeline = await this.pipelineRepository.findById(tenantId, id);
    if (!pipeline) {
      throw new NotFoundException('Pipeline não encontrado');
    }

    const updated = await this.pipelineRepository.update(tenantId, id, {
      isActive: false,
    });

    this.eventEmitter.emit(
      'pipeline.deactivated',
      new PipelineDeactivatedEvent(tenantId, updated, userId),
    );

    return updated;
  }
}
