import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ITagRepository } from '../repositories/tags.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import slugify from 'slugify';
import { Tag } from '@prisma/client';
import { UpdateTagDto } from '../dtos/tags.dto';

@Injectable()
export class UpdateTagUseCase {
  constructor(
    @Inject(ITagRepository) private readonly tagRepository: ITagRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    userId: string,
    tagId: string,
    data: UpdateTagDto,
  ): Promise<Tag> {
    const existing = await this.tagRepository.findById(tenantId, tagId);
    if (!existing) throw new NotFoundException('Tag não encontrada.');

    let slug = existing.slug;
    if (data.name && data.name !== existing.name) {
      slug = slugify(data.name, { lower: true, strict: true });
      const slugConflict = await this.tagRepository.findBySlug(tenantId, slug);
      if (slugConflict && slugConflict.id !== tagId) {
        throw new ConflictException(
          `Uma tag com o nome ou slug '${slug}' já existe neste tenant.`,
        );
      }
    }

    const updated = await this.tagRepository.update(tenantId, tagId, {
      ...data,
      slug,
    });

    this.eventEmitter.emit('audit.log.created', {
      tenantId,
      userId,
      action: 'UPDATED',
      entityName: 'TAG',
      entityId: updated.id,
      oldValues: existing,
      newValues: updated,
    });

    return updated;
  }
}
