import { Injectable, Inject } from '@nestjs/common';
import { ICustomFieldRepository } from '../repositories/custom-fields.repository.interface';
import { CustomField, EntityType } from '@prisma/client';

@Injectable()
export class ListCustomFieldsUseCase {
  constructor(
    @Inject(ICustomFieldRepository) private repository: ICustomFieldRepository,
  ) {}

  async execute(
    tenantId: string,
    entityType?: EntityType,
  ): Promise<CustomField[]> {
    return this.repository.findMany({ tenantId, entityType });
  }
}
