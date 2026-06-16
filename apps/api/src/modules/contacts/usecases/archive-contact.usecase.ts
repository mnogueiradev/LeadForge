import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IContactRepository } from '../repositories/contacts.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ArchiveContactUseCase {
  constructor(
    @Inject(IContactRepository) private repository: IContactRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(tenantId: string, userId: string, id: string): Promise<void> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundException('Contato não encontrado.');
    }

    await this.repository.archive(tenantId, id);

    this.eventEmitter.emit('audit.log.created', {
      tenantId,
      userId,
      action: 'ARCHIVED',
      entityName: 'Contact',
      entityId: id,
    });

    this.eventEmitter.emit('timeline.event.created', {
      tenantId,
      entityType: 'CONTACT',
      entityId: id,
      action: 'CONTACT_ARCHIVED',
      actorId: userId,
      description: 'Contato arquivado',
    });
  }
}
