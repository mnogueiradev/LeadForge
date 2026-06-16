import { Injectable, Inject } from '@nestjs/common';
import {
  ICustomFieldRepository,
  ICustomFieldValueRepository,
} from '../repositories/custom-fields.repository.interface';
import { EntityType, CustomFieldType } from '@prisma/client';

@Injectable()
export class GetEntityCustomFieldsUseCase {
  constructor(
    @Inject(ICustomFieldRepository)
    private fieldRepository: ICustomFieldRepository,
    @Inject(ICustomFieldValueRepository)
    private valueRepository: ICustomFieldValueRepository,
  ) {}

  async execute(tenantId: string, entityType: EntityType, entityId: string) {
    const fields = await this.fieldRepository.findMany({
      tenantId,
      entityType,
    });
    const values = await this.valueRepository.findByEntity(
      tenantId,
      entityType,
      entityId,
    );

    const valuesMap = new Map();
    for (const v of values) {
      let resolvedValue = null;
      const fieldDef = fields.find((f) => f.id === v.customFieldId);
      const type = fieldDef?.fieldType;

      switch (type) {
        case CustomFieldType.TEXT:
        case CustomFieldType.LONG_TEXT:
        case CustomFieldType.EMAIL:
        case CustomFieldType.PHONE:
        case CustomFieldType.URL:
        case CustomFieldType.SELECT:
          resolvedValue = v.valueText;
          break;
        case CustomFieldType.NUMBER:
        case CustomFieldType.DECIMAL:
          resolvedValue = v.valueNumber;
          break;
        case CustomFieldType.BOOLEAN:
          resolvedValue = v.valueBoolean;
          break;
        case CustomFieldType.DATE:
        case CustomFieldType.DATETIME:
          resolvedValue = v.valueDate;
          break;
        case CustomFieldType.JSON:
        case CustomFieldType.MULTI_SELECT:
          resolvedValue = v.valueJson;
          break;
      }

      valuesMap.set(v.customFieldId, resolvedValue);
    }

    return fields.map((field) => ({
      ...field,
      value: valuesMap.get(field.id) ?? null,
    }));
  }
}
