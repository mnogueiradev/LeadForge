import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

import { INoteRepository } from './repositories/notes.repository.interface';
import { PrismaNoteRepository } from './repositories/prisma-notes.repository';

import { NotesController } from './controllers/notes.controller';

import {
  CreateNoteUseCase,
  UpdateNoteUseCase,
  DeleteNoteUseCase,
  TogglePinNoteUseCase,
  ListEntityNotesUseCase,
} from './usecases';

@Module({
  controllers: [NotesController],
  providers: [
    { provide: PrismaClient, useFactory: async () => { const { prisma } = await import('../../lib/prisma'); return prisma; } },
    { provide: INoteRepository, useClass: PrismaNoteRepository },
    CreateNoteUseCase,
    UpdateNoteUseCase,
    DeleteNoteUseCase,
    TogglePinNoteUseCase,
    ListEntityNotesUseCase
  ],
  exports: [INoteRepository],
})
export class NotesModule {}
