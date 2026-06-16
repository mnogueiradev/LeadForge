import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { INoteRepository } from '../repositories/notes.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DeleteNoteUseCase {
  constructor(
    @Inject(INoteRepository) private readonly noteRepository: INoteRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    userId: string,
    noteId: string,
  ): Promise<void> {
    const note = await this.noteRepository.findById(tenantId, noteId);
    if (!note) throw new NotFoundException('Note not found');

    if (note.authorUserId !== userId) {
      throw new ForbiddenException('You can only delete your own notes');
    }

    await this.noteRepository.delete(tenantId, noteId);

    this.eventEmitter.emit('timeline.event.created', {
      tenantId,
      entityType: note.entityType,
      entityId: note.contactId || note.organizationId,
      eventType: 'NOTE_DELETED',
      data: { noteId },
      userId,
    });
  }
}
