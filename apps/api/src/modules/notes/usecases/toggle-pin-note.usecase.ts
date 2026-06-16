import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INoteRepository } from '../repositories/notes.repository.interface';
import { Note } from '@prisma/client';

@Injectable()
export class TogglePinNoteUseCase {
  constructor(
    @Inject(INoteRepository) private readonly noteRepository: INoteRepository,
  ) {}

  async execute(
    tenantId: string,
    noteId: string,
    isPinned: boolean,
  ): Promise<Note> {
    const note = await this.noteRepository.findById(tenantId, noteId);
    if (!note) throw new NotFoundException('Note not found');

    return this.noteRepository.togglePin(tenantId, noteId, isPinned);
  }
}
