import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IOrganizationRepository } from '../repositories/organizations.repository.interface';
import { OrganizationStatus, CompanySize, Organization } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface UpdateOrganizationData {
  name?: string;
  legalName?: string;
  document?: string;
  website?: string;
  email?: string;
  phone?: string;
  industry?: string;
  companySize?: CompanySize;
  description?: string;
  status?: OrganizationStatus;
  address?: any;
}

@Injectable()
export class UpdateOrganizationUseCase {
  constructor(
    @Inject(IOrganizationRepository)
    private repository: IOrganizationRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    userId: string,
    id: string,
    data: UpdateOrganizationData,
  ): Promise<Organization> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundException('Organização não encontrada.');
    }

    if (
      existing.status === 'ARCHIVED' &&
      data.status !== 'ACTIVE' &&
      data.status !== 'PROSPECT' &&
      data.status !== 'CUSTOMER' &&
      data.status !== 'PARTNER' &&
      data.status !== 'SUPPLIER'
    ) {
      throw new BadRequestException(
        'Não é possível editar uma organização arquivada. Restaure-a primeiro.',
      );
    }

    // Validação e formatação de Documento se estiver sendo alterado
    let formattedDocument = data.document;
    if (data.document && data.document !== existing.document) {
      const cleanDoc = data.document.replace(/\D/g, '');
      if (cleanDoc.length === 14) {
        formattedDocument = cleanDoc.replace(
          /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
          '$1.$2.$3/$4-$5',
        );
      } else if (cleanDoc.length === 11) {
        formattedDocument = cleanDoc.replace(
          /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
          '$1.$2.$3-$4',
        );
      }

      const docExists = await this.repository.findByDocument(
        tenantId,
        formattedDocument!,
      );
      if (docExists && docExists.id !== id) {
        throw new BadRequestException(
          'Já existe outra empresa com este documento neste Tenant.',
        );
      }
    }

    const { address, ...restData } = data;

    const updatePayload: any = {
      ...restData,
      ...(formattedDocument && { document: formattedDocument }),
    };

    if (address) {
      updatePayload.addresses = {
        deleteMany: {},
        create: [{
          street: address.street,
          number: address.number,
          complement: address.complement,
          neighborhood: address.district,
          city: address.city,
          state: address.state,
          postalCode: address.zipCode,
          country: address.country,
        }],
      };
    }

    const updated = await this.repository.update(tenantId, id, updatePayload);

    // Auditoria & Timeline
    this.eventEmitter.emit('audit.log.updated', {
      tenantId,
      userId,
      action: 'UPDATED',
      entityName: 'Organization',
      entityId: id,
      oldValues: existing,
      newValues: updated,
    });

    this.eventEmitter.emit('timeline.event.created', {
      tenantId,
      entityType: 'ORGANIZATION',
      entityId: id,
      action: 'ORGANIZATION_UPDATED',
      actorId: userId,
      description: 'Dados da empresa atualizados',
    });

    return updated;
  }
}
