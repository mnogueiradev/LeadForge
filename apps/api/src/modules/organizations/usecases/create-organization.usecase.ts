import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IOrganizationRepository } from '../repositories/organizations.repository.interface';
import { OrganizationStatus, CompanySize, Organization } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClsService } from 'nestjs-cls';
import { SecurityLogSeverity } from '@prisma/client';

export interface CreateOrganizationData {
  name: string;
  legalName?: string;
  document?: string;
  website?: string;
  industry?: string;
  companySize?: CompanySize;
  description?: string;
  status?: OrganizationStatus;
  ownerUserId?: string;
}

@Injectable()
export class CreateOrganizationUseCase {
  constructor(
    @Inject(IOrganizationRepository)
    private repository: IOrganizationRepository,
    private eventEmitter: EventEmitter2,
    private cls: ClsService,
  ) {}

  async execute(
    tenantId: string,
    userId: string,
    data: CreateOrganizationData,
  ): Promise<Organization> {
    // Validação e formatação de Documento
    let formattedDocument = data.document;
    if (data.document) {
      const cleanDoc = data.document.replace(/\D/g, '');
      if (cleanDoc.length === 14) {
        // Formata CNPJ: 00.000.000/0000-00
        formattedDocument = cleanDoc.replace(
          /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
          '$1.$2.$3/$4-$5',
        );
      } else if (cleanDoc.length === 11) {
        // Formata CPF: 000.000.000-00
        formattedDocument = cleanDoc.replace(
          /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
          '$1.$2.$3-$4',
        );
      }

      // Check duplicidade no Tenant
      const existing = await this.repository.findByDocument(
        tenantId,
        formattedDocument!,
      );
      if (existing) {
        throw new BadRequestException(
          'Já existe uma empresa com este documento neste Tenant.',
        );
      }
    }

    const orgToCreate = {
      ...data,
      document: formattedDocument,
      ownerUserId: data.ownerUserId || userId, // Define criador como dono padrão
    };

    const organization = await this.repository.create(tenantId, orgToCreate);

    // Auditoria & Timeline
    this.eventEmitter.emit('audit.log.created', {
      tenantId,
      userId,
      action: 'CREATED',
      entityName: 'Organization',
      entityId: organization.id,
      newValues: organization,
    });

    this.eventEmitter.emit('timeline.event.created', {
      tenantId,
      entityType: 'ORGANIZATION',
      entityId: organization.id,
      action: 'ORGANIZATION_CREATED',
      actorId: userId,
      description: 'Empresa criada',
    });

    return organization;
  }
}
