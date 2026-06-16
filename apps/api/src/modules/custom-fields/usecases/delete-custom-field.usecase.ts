import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ICustomFieldRepository } from '../repositories/custom-fields.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DeleteCustomFieldUseCase {
  constructor(
    @Inject(ICustomFieldRepository) private repository: ICustomFieldRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(tenantId: string, userId: string, id: string): Promise<void> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundException('Campo personalizado não encontrado.');
    }

    // Verificar se o campo está em uso
    const usageCount = await this.repository.countValuesByFieldId(tenantId, id);
    if (usageCount > 0) {
      throw new BadRequestException(
        `Não é possível excluir o campo pois ele possui ${usageCount} valores preenchidos. Desative-o em vez de excluí-lo.`,
      );
    }

    await this.repository.delete(tenantId, id);

    this.eventEmitter.emit('audit.log.deleted', {
      tenantId,
      userId,
      action: 'DELETED',
      entityName: 'CustomField',
      entityId: id,
    });
  }
}
