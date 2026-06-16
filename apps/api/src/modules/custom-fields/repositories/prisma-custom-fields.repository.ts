import { Injectable } from '@nestjs/common';
import {
  PrismaClient,
  CustomField,
  CustomFieldValue,
  EntityType,
} from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import {
  ICustomFieldRepository,
  ICustomFieldValueRepository,
  FindCustomFieldsParams,
} from './custom-fields.repository.interface';

@Injectable()
export class PrismaCustomFieldRepository implements ICustomFieldRepository {
  constructor(
    private prisma: PrismaClient,
    private cls: ClsService,
  ) {}

  async create(
    tenantId: string,
    data: Partial<CustomField>,
  ): Promise<CustomField> {
    return this.prisma.customField.create({
      data: {
        ...data,
        tenantId,
      } as any,
    });
  }

  async update(
    tenantId: string,
    id: string,
    data: Partial<CustomField>,
  ): Promise<CustomField> {
    const { tenantId: _, ...updateData } = data as any;
    return this.prisma.customField.update({
      where: { id, tenantId },
      data: updateData,
    });
  }

  async findById(tenantId: string, id: string): Promise<CustomField | null> {
    return this.prisma.customField.findFirst({
      where: { id, tenantId },
    });
  }

  async findBySlug(
    tenantId: string,
    entityType: EntityType,
    slug: string,
  ): Promise<CustomField | null> {
    return this.prisma.customField.findFirst({
      where: { tenantId, entityType, slug },
    });
  }

  async findMany(params: FindCustomFieldsParams): Promise<CustomField[]> {
    const { tenantId, entityType } = params;
    const where: any = { tenantId };
    if (entityType) {
      where.entityType = entityType;
    }

    return this.prisma.customField.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
    });
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.prisma.customField.delete({
      where: { id, tenantId },
    });
  }

  async countValuesByFieldId(
    tenantId: string,
    fieldId: string,
  ): Promise<number> {
    return this.prisma.customFieldValue.count({
      where: { tenantId, customFieldId: fieldId },
    });
  }
}

@Injectable()
export class PrismaCustomFieldValueRepository implements ICustomFieldValueRepository {
  constructor(
    private prisma: PrismaClient,
    private cls: ClsService,
  ) {}

  async upsert(
    tenantId: string,
    customFieldId: string,
    entityType: EntityType,
    entityId: string,
    valueData: Partial<CustomFieldValue>,
  ): Promise<CustomFieldValue> {
    // Identificar a qual coluna FK o entityId pertence
    let contactId = null;
    let organizationId = null;

    if (entityType === EntityType.CONTACT) {
      contactId = entityId;
    } else if (entityType === EntityType.ORGANIZATION) {
      organizationId = entityId;
    }

    const whereClause: any = {
      tenantId,
      customFieldId,
      entityType,
    };

    if (contactId) whereClause.contactId = contactId;
    if (organizationId) whereClause.organizationId = organizationId;

    // Buscar se já existe para fazer Upsert manual
    // Não podemos usar prisma upsert direto aqui devido às restrições compostas
    // dinâmicas que dependem se contactId ou organizationId é nulo ou não.

    let existing = null;

    if (contactId) {
      existing = await this.prisma.customFieldValue.findFirst({
        where: { tenantId, customFieldId, contactId },
      });
    } else if (organizationId) {
      existing = await this.prisma.customFieldValue.findFirst({
        where: { tenantId, customFieldId, organizationId },
      });
    }

    const dataToSave = {
      tenantId,
      customFieldId,
      entityType,
      contactId,
      organizationId,
      valueText: valueData.valueText ?? null,
      valueNumber: valueData.valueNumber ?? null,
      valueBoolean: valueData.valueBoolean ?? null,
      valueDate: valueData.valueDate ?? null,
      valueJson: valueData.valueJson === null ? undefined : valueData.valueJson,
    };

    if (existing) {
      return this.prisma.customFieldValue.update({
        where: { id: existing.id },
        data: dataToSave,
      });
    } else {
      return this.prisma.customFieldValue.create({
        data: dataToSave,
      });
    }
  }

  async findByEntity(
    tenantId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<CustomFieldValue[]> {
    const where: any = { tenantId, entityType };
    if (entityType === EntityType.CONTACT) {
      where.contactId = entityId;
    } else if (entityType === EntityType.ORGANIZATION) {
      where.organizationId = entityId;
    }

    return this.prisma.customFieldValue.findMany({
      where,
      include: {
        customField: true,
      },
    });
  }

  async findByFieldAndEntity(
    tenantId: string,
    customFieldId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<CustomFieldValue | null> {
    const where: any = { tenantId, customFieldId, entityType };
    if (entityType === EntityType.CONTACT) {
      where.contactId = entityId;
    } else if (entityType === EntityType.ORGANIZATION) {
      where.organizationId = entityId;
    }

    return this.prisma.customFieldValue.findFirst({
      where,
    });
  }
}
