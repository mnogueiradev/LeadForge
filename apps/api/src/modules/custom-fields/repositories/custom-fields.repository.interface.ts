import {
  CustomField,
  CustomFieldValue,
  EntityType,
  CustomFieldType,
} from '@prisma/client';

export interface FindCustomFieldsParams {
  tenantId: string;
  entityType?: EntityType;
}

export const ICustomFieldRepository = Symbol('ICustomFieldRepository');

export interface ICustomFieldRepository {
  create(tenantId: string, data: Partial<CustomField>): Promise<CustomField>;
  update(
    tenantId: string,
    id: string,
    data: Partial<CustomField>,
  ): Promise<CustomField>;
  findById(tenantId: string, id: string): Promise<CustomField | null>;
  findBySlug(
    tenantId: string,
    entityType: EntityType,
    slug: string,
  ): Promise<CustomField | null>;
  findMany(params: FindCustomFieldsParams): Promise<CustomField[]>;
  delete(tenantId: string, id: string): Promise<void>;
  countValuesByFieldId(tenantId: string, fieldId: string): Promise<number>;
}

export const ICustomFieldValueRepository = Symbol(
  'ICustomFieldValueRepository',
);

export interface ICustomFieldValueRepository {
  upsert(
    tenantId: string,
    customFieldId: string,
    entityType: EntityType,
    entityId: string,
    valueData: Partial<CustomFieldValue>,
  ): Promise<CustomFieldValue>;

  findByEntity(
    tenantId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<CustomFieldValue[]>;

  findByFieldAndEntity(
    tenantId: string,
    customFieldId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<CustomFieldValue | null>;
}
