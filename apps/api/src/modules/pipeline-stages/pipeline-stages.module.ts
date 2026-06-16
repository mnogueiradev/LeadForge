import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PipelineStagesService } from './pipeline-stages.service';
import { PipelineStagesController } from './pipeline-stages.controller';

@Module({
  controllers: [PipelineStagesController],
  providers: [
    { provide: PrismaClient, useFactory: () => new PrismaClient({ log: ['error', 'warn'] }) },
    PipelineStagesService
  ],
  exports: [PipelineStagesService],
})
export class PipelineStagesModule {}
