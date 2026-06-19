import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import {
  ITagRepository,
  ITagAssignmentRepository,
} from './repositories/tags.repository.interface';
import {
  PrismaTagRepository,
  PrismaTagAssignmentRepository,
} from './repositories/prisma-tags.repository';

import { TagsController } from './controllers/tags.controller';
import { TagAssignmentsController } from './controllers/tag-assignments.controller';

import {
  CreateTagUseCase,
  UpdateTagUseCase,
  DeleteTagUseCase,
  ListTagsUseCase,
  AssignTagUseCase,
  RemoveTagUseCase,
  ListEntityTagsUseCase,
} from './usecases';

@Module({
  controllers: [TagsController, TagAssignmentsController],
  providers: [
    { provide: PrismaClient, useFactory: async () => { const { prisma } = await import('../../lib/prisma'); return prisma; } },
    { provide: ITagRepository, useClass: PrismaTagRepository },
    { provide: ITagAssignmentRepository, useClass: PrismaTagAssignmentRepository },
    CreateTagUseCase,
    UpdateTagUseCase,
    DeleteTagUseCase,
    ListTagsUseCase,
    AssignTagUseCase,
    RemoveTagUseCase,
    ListEntityTagsUseCase
  ],
  exports: [ITagRepository, ITagAssignmentRepository],
})
export class TagsModule {}
