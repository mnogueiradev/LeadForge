import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPipelineRepository } from '../repositories/pipelines.repository.interface';
import { PIPELINE_REPOSITORY } from '../repositories/pipelines.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PipelineDefaultChangedEvent } from '../events/pipeline.events';

@Injectable()
export class SetDefaultPipelineUseCase {
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

    await this.pipelineRepository.unsetDefaultForTenant(tenantId);

    const updated = await this.pipelineRepository.update(tenantId, id, {
      isDefault: true,
    });

    this.eventEmitter.emit(
      'pipeline.default_changed',
      new PipelineDefaultChangedEvent(tenantId, updated, userId),
    );

    return updated;
  }
}
