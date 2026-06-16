import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ICustomFieldRepository,
  ICustomFieldValueRepository,
} from '../repositories/custom-fields.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SetEntityCustomFieldsDto } from '../dtos/custom-fields.dto';
import { CustomFieldType, CustomFieldValue } from '@prisma/client';

@Injectable()
export class SetCustomFieldValuesUseCase {
  constructor(
    @Inject(ICustomFieldRepository)
    private fieldRepository: ICustomFieldRepository,
    @Inject(ICustomFieldValueRepository)
    private valueRepository: ICustomFieldValueRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    userId: string,
    data: SetEntityCustomFieldsDto,
  ): Promise<void> {
    const { entityType, entityId, fields } = data;

    for (const fieldInput of fields) {
      const fieldDef = await this.fieldRepository.findBySlug(
        tenantId,
        entityType,
        fieldInput.slug,
      );

      if (!fieldDef) {
        throw new NotFoundException(
          `Campo personalizado com slug '${fieldInput.slug}' não encontrado.`,
        );
      }

      if (!fieldDef.isActive) {
        throw new BadRequestException(
          `O campo '${fieldInput.slug}' está desativado e não pode ser preenchido.`,
        );
      }

      // Validação Básica (Pode ser expandida depois para regex, min, max, options)
      const valueData: Partial<CustomFieldValue> = {};
      const val = fieldInput.value;

      if (val === null || val === undefined) {
        if (fieldDef.isRequired) {
          throw new BadRequestException(
            `O campo '${fieldDef.name}' é obrigatório.`,
          );
        }
      } else {
        switch (fieldDef.fieldType) {
          case CustomFieldType.TEXT:
          case CustomFieldType.LONG_TEXT:
          case CustomFieldType.EMAIL:
          case CustomFieldType.PHONE:
          case CustomFieldType.URL:
          case CustomFieldType.SELECT:
            valueData.valueText = String(val);
            break;
          case CustomFieldType.NUMBER:
          case CustomFieldType.DECIMAL:
            const num = Number(val);
            if (isNaN(num))
              throw new BadRequestException(
                `Valor inválido para o campo numérico '${fieldDef.name}'.`,
              );
            valueData.valueNumber = num as any;
            break;
          case CustomFieldType.BOOLEAN:
            valueData.valueBoolean = Boolean(val);
            break;
          case CustomFieldType.DATE:
          case CustomFieldType.DATETIME:
            const d = new Date(val);
            if (isNaN(d.getTime()))
              throw new BadRequestException(
                `Data inválida para o campo '${fieldDef.name}'.`,
              );
            valueData.valueDate = d;
            break;
          case CustomFieldType.JSON:
          case CustomFieldType.MULTI_SELECT:
            valueData.valueJson = val; // Presume-se ser array ou object
            break;
        }
      }

      const updatedValue = await this.valueRepository.upsert(
        tenantId,
        fieldDef.id,
        entityType,
        entityId,
        valueData,
      );

      this.eventEmitter.emit('timeline.event.created', {
        tenantId,
        entityType,
        entityId,
        action: 'CUSTOM_FIELD_UPDATED',
        actorId: userId,
        description: `Campo '${fieldDef.name}' atualizado.`,
      });
    }
  }
}
