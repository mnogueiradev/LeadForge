import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import {
  ITagRepository,
  ITagAssignmentRepository,
} from '../repositories/tags.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AssignTagDto } from '../dtos/tags.dto';

@Injectable()
export class AssignTagUseCase {
  constructor(
    @Inject(ITagRepository) private readonly tagRepository: ITagRepository,
    @Inject(ITagAssignmentRepository)
    private readonly assignmentRepository: ITagAssignmentRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    userId: string,
    data: AssignTagDto,
  ): Promise<void> {
    const { tagId, entityType, entityId } = data;

    const tag = await this.tagRepository.findById(tenantId, tagId);
    if (!tag) throw new NotFoundException('Tag não encontrada.');
    if (!tag.isActive)
      throw new BadRequestException('Não é possível vincular uma tag inativa.');

    const alreadyAssigned = await this.assignmentRepository.exists(
      tenantId,
      tagId,
      entityType,
      entityId,
    );
    if (alreadyAssigned)
      throw new ConflictException('A tag já está vinculada a esta entidade.');

    // Pode ser implementado um limite lógico aqui se necessário futuramente.

    await this.assignmentRepository.assign({
      tenantId,
      tagId,
      entityType,
      contactId: entityType === 'CONTACT' ? entityId : null,
      organizationId: entityType === 'ORGANIZATION' ? entityId : null,
      leadId: entityType === 'LEAD' ? entityId : null,
      dealId: entityType === 'DEAL' ? entityId : null,
      assignedById: userId,
    });

    this.eventEmitter.emit('audit.log.created', {
      tenantId,
      userId,
      action: 'ASSIGNED',
      entityName: 'TAG_ASSIGNMENT',
      entityId: `${tagId}:${entityId}`,
      newValues: { tagId, entityType, entityId },
    });

    this.eventEmitter.emit('timeline.event.created', {
      tenantId,
      entityType,
      entityId,
      action: 'TAG_ASSIGNED',
      actorId: userId,
      description: `Tag '${tag.name}' adicionada.`,
    });
  }
}
