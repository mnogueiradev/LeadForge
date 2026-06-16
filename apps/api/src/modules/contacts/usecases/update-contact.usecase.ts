import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IContactRepository } from '../repositories/contacts.repository.interface';
import { Contact } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateContactDto } from '../dtos/contacts.dto';

@Injectable()
export class UpdateContactUseCase {
  constructor(
    @Inject(IContactRepository) private repository: IContactRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    userId: string,
    id: string,
    data: UpdateContactDto,
  ): Promise<Contact> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundException('Contato não encontrado.');
    }

    if (
      existing.status === 'ARCHIVED' &&
      data.status !== 'ACTIVE' &&
      data.status !== 'INACTIVE'
    ) {
      throw new BadRequestException(
        'Não é possível editar um contato arquivado. Restaure-o primeiro.',
      );
    }

    const primaryEmail = data.primaryEmail
      ? data.primaryEmail.trim().toLowerCase()
      : undefined;
    if (primaryEmail && primaryEmail !== existing.primaryEmail) {
      const emailExists = await this.repository.findByPrimaryEmail(
        tenantId,
        primaryEmail,
      );
      if (emailExists && emailExists.id !== id) {
        throw new BadRequestException(
          'Já existe outro contato com este e-mail principal neste Tenant.',
        );
      }
    }

    let primaryPhone = data.primaryPhone;
    if (primaryPhone) {
      primaryPhone = primaryPhone.replace(/[^\d+]/g, '');
      if (!primaryPhone.startsWith('+')) {
        primaryPhone = '+' + primaryPhone;
      }
    }

    const { birthDate, ...restData } = data;

    const updateData: Partial<Contact> = {
      ...restData,
    };

    if (data.firstName) updateData.firstName = data.firstName.trim();
    if (data.lastName) updateData.lastName = data.lastName.trim();
    if (primaryEmail !== undefined) updateData.primaryEmail = primaryEmail;
    if (primaryPhone !== undefined) updateData.primaryPhone = primaryPhone;
    if (birthDate !== undefined)
      updateData.birthDate = birthDate ? new Date(birthDate) : null;

    const updated = await this.repository.update(tenantId, id, updateData);

    // Auditoria & Timeline
    this.eventEmitter.emit('audit.log.updated', {
      tenantId,
      userId,
      action: 'UPDATED',
      entityName: 'Contact',
      entityId: id,
      oldValues: existing,
      newValues: updated,
    });

    this.eventEmitter.emit('timeline.event.created', {
      tenantId,
      entityType: 'CONTACT',
      entityId: id,
      action: 'CONTACT_UPDATED',
      actorId: userId,
      description: 'Dados do contato atualizados',
    });

    return updated;
  }
}
