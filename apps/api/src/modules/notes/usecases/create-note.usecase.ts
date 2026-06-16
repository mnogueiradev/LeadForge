import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import {
  INoteRepository,
  CreateNoteData,
} from '../repositories/notes.repository.interface';
import { Note } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CreateNoteUseCase {
  constructor(
    @Inject(INoteRepository) private readonly noteRepository: INoteRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    authorId: string,
    data: CreateNoteData,
  ): Promise<Note> {
    const note = await this.noteRepository.create(tenantId, authorId, data);

    // Timeline Integration
    this.eventEmitter.emit('timeline.event.created', {
      tenantId,
      entityType: data.entityType,
      entityId: data.entityId,
      eventType: 'NOTE_CREATED',
      data: { noteId: note.id, title: note.title },
      userId: authorId,
    });

    return note;
  }
}
