import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PipelineMovementsController } from './pipeline-movements.controller';
import { ValidateStageTransitionUseCase } from './usecases/validate-stage-transition.usecase';
import { MoveDealStageUseCase } from './usecases/move-deal-stage.usecase';
import { GetMovementHistoryUseCase } from './usecases/get-movement-history.usecase';
import { ListStageMovementsUseCase } from './usecases/list-stage-movements.usecase';

@Module({
  controllers: [PipelineMovementsController],
  providers: [
    { provide: PrismaClient, useFactory: () => new PrismaClient({ log: ['error', 'warn'] }) },
    ValidateStageTransitionUseCase,
    MoveDealStageUseCase,
    GetMovementHistoryUseCase,
    ListStageMovementsUseCase
  ],
  exports: [MoveDealStageUseCase, ValidateStageTransitionUseCase],
})
export class PipelineMovementsModule {}
