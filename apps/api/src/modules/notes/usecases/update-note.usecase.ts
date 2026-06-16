import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  INoteRepository,
  UpdateNoteData,
} from '../repositories/notes.repository.interface';
import { Note } from '@prisma/client';

@Injectable()
export class UpdateNoteUseCase {
  constructor(
    @Inject(INoteRepository) private readonly noteRepository: INoteRepository,
  ) {}

  async execute(
    tenantId: string,
    userId: string,
    noteId: string,
    data: UpdateNoteData,
  ): Promise<Note> {
    const note = await this.noteRepository.findById(tenantId, noteId);
    if (!note) throw new NotFoundException('Note not found');

    // Regra: Somente o autor pode editar a nota (ou um ADMIN - mas isso seria tratado no controller/guard)
    if (note.authorUserId !== userId) {
      throw new ForbiddenException('You can only edit your own notes');
    }

    return this.noteRepository.update(tenantId, noteId, data);
  }
}
