import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IContactRepository } from '../repositories/contacts.repository.interface';
import {
  Contact,
  ContactEmail,
  ContactPhone,
  ContactSource,
  ContactStatus,
} from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateContactDto } from '../dtos/contacts.dto';

@Injectable()
export class CreateContactUseCase {
  constructor(
    @Inject(IContactRepository) private repository: IContactRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    userId: string,
    data: CreateContactDto,
  ): Promise<Contact> {
    // Normalização de E-mail
    const primaryEmail = data.primaryEmail
      ? data.primaryEmail.trim().toLowerCase()
      : null;

    if (primaryEmail) {
      const existing = await this.repository.findByPrimaryEmail(
        tenantId,
        primaryEmail,
      );
      if (existing) {
        throw new BadRequestException(
          'Já existe um contato com este e-mail principal neste Tenant.',
        );
      }
    }

    // Normalização de telefone (E.164 básico)
    let primaryPhone = data.primaryPhone;
    if (primaryPhone) {
      primaryPhone = primaryPhone.replace(/[^\d+]/g, '');
      if (!primaryPhone.startsWith('+')) {
        primaryPhone = '+' + primaryPhone; // Simplificação para garantir formato
      }
    }

    const contactData: Partial<Contact> = {
      firstName: data.firstName.trim(),
      lastName: data.lastName?.trim() || null,
      primaryEmail: primaryEmail || null,
      primaryPhone: primaryPhone || null,
      jobTitle: data.jobTitle || null,
      department: data.department || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      status: data.status || ContactStatus.ACTIVE,
      source: data.source || ContactSource.MANUAL,
      description: data.description || null,
      organizationId: data.organizationId || null,
      ownerUserId: data.ownerUserId || userId,
    };

    const emails: Partial<ContactEmail>[] = [];
    if (data.additionalEmails) {
      data.additionalEmails.forEach((e) =>
        emails.push({
          email: e.email.toLowerCase(),
          type: e.type,
          isPrimary: e.isPrimary || false,
        }),
      );
    }

    const phones: Partial<ContactPhone>[] = [];
    if (data.additionalPhones) {
      data.additionalPhones.forEach((p) =>
        phones.push({
          number: p.number.replace(/[^\d+]/g, ''),
          type: p.type,
          isPrimary: p.isPrimary || false,
        }),
      );
    }

    const contact = await this.repository.create(
      tenantId,
      contactData,
      emails,
      phones,
    );

    // Auditoria & Timeline
    this.eventEmitter.emit('audit.log.created', {
      tenantId,
      userId,
      action: 'CREATED',
      entityName: 'Contact',
      entityId: contact.id,
      newValues: contact,
    });

    this.eventEmitter.emit('timeline.event.created', {
      tenantId,
      entityType: 'CONTACT',
      entityId: contact.id,
      action: 'CONTACT_CREATED',
      actorId: userId,
      description: 'Contato criado',
    });

    return contact;
  }
}
