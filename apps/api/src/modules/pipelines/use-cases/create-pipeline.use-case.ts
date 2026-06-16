import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IPipelineRepository } from '../repositories/pipelines.repository.interface';
import { PIPELINE_REPOSITORY } from '../repositories/pipelines.repository.interface';
import { CreatePipelineDto } from '../dtos/create-pipeline.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PipelineCreatedEvent,
  PipelineDefaultChangedEvent,
} from '../events/pipeline.events';

@Injectable()
export class CreatePipelineUseCase {
  constructor(
    @Inject(PIPELINE_REPOSITORY)
    private readonly pipelineRepository: IPipelineRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(tenantId: string, userId: string, dto: CreatePipelineDto) {
    if (dto.isDefault) {
      await this.pipelineRepository.unsetDefaultForTenant(tenantId);
    }

    const [, total] = await this.pipelineRepository.findAll(tenantId, {});
    const order = total; // Coloca no fim da lista

    const pipeline = await this.pipelineRepository.create(tenantId, {
      name: dto.name,
      description: dto.description || null,
      isDefault: dto.isDefault ?? false,
      isActive: true,
      displayOrder: order,
      createdById: userId,
    });

    this.eventEmitter.emit(
      'pipeline.created',
      new PipelineCreatedEvent(tenantId, pipeline, userId),
    );

    if (pipeline.isDefault) {
      this.eventEmitter.emit(
        'pipeline.default_changed',
        new PipelineDefaultChangedEvent(tenantId, pipeline, userId),
      );
    }

    return pipeline;
  }
}
