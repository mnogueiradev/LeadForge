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
    { provide: PrismaClient, useFactory: () => { if (!(globalThis as any).prisma) (globalThis as any).prisma = new PrismaClient({ log: ['error', 'warn'] }); return (globalThis as any).prisma; } },
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
