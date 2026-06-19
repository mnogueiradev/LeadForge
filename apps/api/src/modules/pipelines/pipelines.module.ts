import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PipelinesController } from './pipelines.controller';
import { PIPELINE_REPOSITORY } from './repositories/pipelines.repository.interface';
import { PrismaPipelineRepository } from './repositories/prisma-pipelines.repository';
import {
  CreatePipelineUseCase,
  UpdatePipelineUseCase,
  DeletePipelineUseCase,
  ArchivePipelineUseCase,
  ActivatePipelineUseCase,
  DeactivatePipelineUseCase,
  SetDefaultPipelineUseCase,
  ReorderPipelinesUseCase,
  GetPipelineUseCase,
  ListPipelinesUseCase,
} from './use-cases';

@Module({
  controllers: [PipelinesController],
  providers: [
    { provide: PrismaClient, useFactory: async () => { const { prisma } = await import('../../lib/prisma'); return prisma; } },
    { provide: PIPELINE_REPOSITORY, useClass: PrismaPipelineRepository },
    CreatePipelineUseCase,
    UpdatePipelineUseCase,
    DeletePipelineUseCase,
    ArchivePipelineUseCase,
    ActivatePipelineUseCase,
    DeactivatePipelineUseCase,
    SetDefaultPipelineUseCase,
    ReorderPipelinesUseCase,
    GetPipelineUseCase,
    ListPipelinesUseCase
  ],
  exports: [PIPELINE_REPOSITORY],
})
export class PipelinesModule {}
