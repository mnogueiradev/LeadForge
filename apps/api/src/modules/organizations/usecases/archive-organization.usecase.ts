import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IOrganizationRepository } from '../repositories/organizations.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ArchiveOrganizationUseCase {
  constructor(
    @Inject(IOrganizationRepository)
    private repository: IOrganizationRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(tenantId: string, userId: string, id: string): Promise<void> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundException('Organização não encontrada.');
    }

    await this.repository.archive(tenantId, id);

    this.eventEmitter.emit('audit.log.created', {
      tenantId,
      userId,
      action: 'ARCHIVED',
      entityName: 'Organization',
      entityId: id,
    });

    this.eventEmitter.emit('timeline.event.created', {
      tenantId,
      entityType: 'ORGANIZATION',
      entityId: id,
      action: 'ORGANIZATION_ARCHIVED',
      actorId: userId,
      description: 'Empresa arquivada',
    });
  }
}
