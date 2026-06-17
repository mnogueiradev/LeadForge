import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PipelineStagesService } from './pipeline-stages.service';
import { PipelineStagesController } from './pipeline-stages.controller';

@Module({
  controllers: [PipelineStagesController],
  providers: [
    { provide: PrismaClient, useFactory: () => { if (!(globalThis as any).prisma) (globalThis as any).prisma = new PrismaClient({ log: ['error', 'warn'] }); return (globalThis as any).prisma; } },
    PipelineStagesService
  ],
  exports: [PipelineStagesService],
})
export class PipelineStagesModule {}
