import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PipelineMovementsController } from './pipeline-movements.controller';
import { ValidateStageTransitionUseCase } from './usecases/validate-stage-transition.usecase';
import { MoveDealStageUseCase } from './usecases/move-deal-stage.usecase';
import { GetMovementHistoryUseCase } from './usecases/get-movement-history.usecase';
import { ListStageMovementsUseCase } from './usecases/list-stage-movements.usecase';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule],
  controllers: [PipelineMovementsController],
  providers: [
    { provide: PrismaClient, useFactory: async () => { const { prisma } = await import('../../lib/prisma'); return prisma; } },
    ValidateStageTransitionUseCase,
    MoveDealStageUseCase,
    GetMovementHistoryUseCase,
    ListStageMovementsUseCase
  ],
  exports: [MoveDealStageUseCase, ValidateStageTransitionUseCase],
})
export class PipelineMovementsModule {}
