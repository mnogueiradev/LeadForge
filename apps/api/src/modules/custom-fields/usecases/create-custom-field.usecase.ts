import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ICustomFieldRepository } from '../repositories/custom-fields.repository.interface';
import { CustomField } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateCustomFieldDto } from '../dtos/custom-fields.dto';
import slugify from 'slugify';

@Injectable()
export class CreateCustomFieldUseCase {
  constructor(
    @Inject(ICustomFieldRepository) private repository: ICustomFieldRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    userId: string,
    data: CreateCustomFieldDto,
  ): Promise<CustomField> {
    const slug = data.slug
      ? slugify(data.slug, { lower: true, strict: true })
      : slugify(data.name, { lower: true, strict: true });

    const existing = await this.repository.findBySlug(
      tenantId,
      data.entityType,
      slug,
    );
    if (existing) {
      throw new BadRequestException(
        'Já existe um campo personalizado com este identificador para esta entidade.',
      );
    }

    const fieldData: Partial<CustomField> = {
      entityType: data.entityType,
      name: data.name,
      slug,
      description: data.description || null,
      fieldType: data.fieldType,
      isRequired: data.isRequired || false,
      isUnique: data.isUnique || false,
      options: (data.options as any) || null,
      validation: (data.validation as any) || null,
      defaultValue: data.defaultValue || null,
      displayOrder: data.displayOrder || 0,
    };

    const customField = await this.repository.create(tenantId, fieldData);

    this.eventEmitter.emit('audit.log.created', {
      tenantId,
      userId,
      action: 'CREATED',
      entityName: 'CustomField',
      entityId: customField.id,
      newValues: customField,
    });

    return customField;
  }
}
