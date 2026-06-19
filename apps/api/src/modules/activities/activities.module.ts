import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ActivitiesController } from './activities.controller';

import { CreateActivityUseCase } from './usecases/create-activity.usecase';
import { UpdateActivityUseCase } from './usecases/update-activity.usecase';
import { DeleteActivityUseCase } from './usecases/delete-activity.usecase';
import { AssignActivityUseCase } from './usecases/assign-activity.usecase';
import { StartActivityUseCase } from './usecases/start-activity.usecase';
import { CompleteActivityUseCase } from './usecases/complete-activity.usecase';
import { CancelActivityUseCase } from './usecases/cancel-activity.usecase';
import { GetActivityUseCase } from './usecases/get-activity.usecase';
import { ListActivitiesUseCase } from './usecases/list-activities.usecase';

@Module({
  controllers: [ActivitiesController],
  providers: [
    { provide: PrismaClient, useFactory: async () => { const { prisma } = await import('../../lib/prisma'); return prisma; } },
    CreateActivityUseCase,
    UpdateActivityUseCase,
    DeleteActivityUseCase,
    AssignActivityUseCase,
    StartActivityUseCase,
    CompleteActivityUseCase,
    CancelActivityUseCase,
    GetActivityUseCase,
    ListActivitiesUseCase
  ],
  exports: [
    CreateActivityUseCase,
    UpdateActivityUseCase,
    DeleteActivityUseCase,
    AssignActivityUseCase,
    StartActivityUseCase,
    CompleteActivityUseCase,
    CancelActivityUseCase,
    GetActivityUseCase,
    ListActivitiesUseCase,
  ],
})
export class ActivitiesModule {}
