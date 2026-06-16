import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITagRepository } from '../repositories/tags.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DeleteTagUseCase {
  constructor(
    @Inject(ITagRepository) private readonly tagRepository: ITagRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    userId: string,
    tagId: string,
  ): Promise<void> {
    const existing = await this.tagRepository.findById(tenantId, tagId);
    if (!existing) throw new NotFoundException('Tag não encontrada.');

    // Realiza exclusão lógica conforme regra de negócios
    await this.tagRepository.deleteLogical(tenantId, tagId);

    this.eventEmitter.emit('audit.log.created', {
      tenantId,
      userId,
      action: 'DELETED',
      entityName: 'TAG',
      entityId: tagId,
      oldValues: existing,
    });
  }
}
