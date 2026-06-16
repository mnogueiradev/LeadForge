import { Injectable, Inject } from '@nestjs/common';
import { INoteRepository } from '../repositories/notes.repository.interface';
import { Note, EntityType } from '@prisma/client';

@Injectable()
export class ListEntityNotesUseCase {
  constructor(
    @Inject(INoteRepository) private readonly noteRepository: INoteRepository,
  ) {}

  async execute(
    tenantId: string,
    userId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<Note[]> {
    const notes = await this.noteRepository.findByEntity(
      tenantId,
      entityType,
      entityId,
    );

    // Filtro de visibilidade
    // PRIVATE = Só o dono vê
    // TEAM = Futuro (Nesse MVP, todos do time veriam, vamos tratar como TENANT por enquanto)
    // TENANT = Todos do tenant veem

    return notes.filter((note) => {
      if (note.visibility === 'PRIVATE') {
        return note.authorUserId === userId;
      }
      return true; // TEAM e TENANT visíveis
    });
  }
}
