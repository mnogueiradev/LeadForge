import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ICustomFieldRepository } from '../repositories/custom-fields.repository.interface';
import { CustomField } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateCustomFieldDto } from '../dtos/custom-fields.dto';

@Injectable()
export class UpdateCustomFieldUseCase {
  constructor(
    @Inject(ICustomFieldRepository) private repository: ICustomFieldRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    userId: string,
    id: string,
    data: UpdateCustomFieldDto,
  ): Promise<CustomField> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundException('Campo personalizado não encontrado.');
    }

    const updateData: Partial<CustomField> = { ...data } as any;

    const updated = await this.repository.update(tenantId, id, updateData);

    this.eventEmitter.emit('audit.log.updated', {
      tenantId,
      userId,
      action: 'UPDATED',
      entityName: 'CustomField',
      entityId: id,
      oldValues: existing,
      newValues: updated,
    });

    return updated;
  }
}
