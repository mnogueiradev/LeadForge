import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IContactRepository } from '../repositories/contacts.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ChangeContactOwnerUseCase {
  constructor(
    @Inject(IContactRepository) private repository: IContactRepository,
    private prisma: PrismaClient,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    userId: string,
    id: string,
    newOwnerId: string,
  ): Promise<void> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundException('Contato não encontrado.');
    }

    const newOwner = await this.prisma.user.findFirst({
      where: { id: newOwnerId, tenantId, deletedAt: null },
    });

    if (!newOwner) {
      throw new BadRequestException(
        'O novo responsável informado não é válido ou não pertence a este Tenant.',
      );
    }

    await this.repository.updateOwner(tenantId, id, newOwnerId);

    this.eventEmitter.emit('audit.log.updated', {
      tenantId,
      userId,
      action: 'OWNER_CHANGED',
      entityName: 'Contact',
      entityId: id,
      oldValues: { ownerUserId: existing.ownerUserId },
      newValues: { ownerUserId: newOwnerId },
    });

    this.eventEmitter.emit('timeline.event.created', {
      tenantId,
      entityType: 'CONTACT',
      entityId: id,
      action: 'CONTACT_OWNER_CHANGED',
      actorId: userId,
      description: 'Responsável pelo contato alterado',
    });
  }
}
