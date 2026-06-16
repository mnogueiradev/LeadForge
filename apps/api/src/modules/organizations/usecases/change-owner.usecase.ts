import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IOrganizationRepository } from '../repositories/organizations.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ChangeOrganizationOwnerUseCase {
  constructor(
    @Inject(IOrganizationRepository)
    private repository: IOrganizationRepository,
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
      throw new NotFoundException('Organização não encontrada.');
    }

    // Valida se o novo owner existe e pertence ao mesmo tenant
    const newOwner = await this.prisma.user.findFirst({
      where: { id: newOwnerId, tenantId, deletedAt: null },
    });

    if (!newOwner) {
      throw new BadRequestException(
        'O novo responsável informado não é válido ou não pertence a esta organização.',
      );
    }

    await this.repository.updateOwner(tenantId, id, newOwnerId);

    this.eventEmitter.emit('audit.log.updated', {
      tenantId,
      userId,
      action: 'OWNER_CHANGED',
      entityName: 'Organization',
      entityId: id,
      oldValues: { ownerUserId: existing.ownerUserId },
      newValues: { ownerUserId: newOwnerId },
    });

    this.eventEmitter.emit('timeline.event.created', {
      tenantId,
      entityType: 'ORGANIZATION',
      entityId: id,
      action: 'ORGANIZATION_OWNER_CHANGED',
      actorId: userId,
      description: 'Responsável pela empresa alterado',
    });
  }
}
