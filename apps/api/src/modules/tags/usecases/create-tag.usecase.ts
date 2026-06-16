import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { ITagRepository } from '../repositories/tags.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import slugify from 'slugify';
import { Tag } from '@prisma/client';
import { CreateTagDto } from '../dtos/tags.dto';

@Injectable()
export class CreateTagUseCase {
  constructor(
    @Inject(ITagRepository) private readonly tagRepository: ITagRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    userId: string,
    data: CreateTagDto,
  ): Promise<Tag> {
    const slug = slugify(data.name, { lower: true, strict: true });

    const existing = await this.tagRepository.findBySlug(tenantId, slug);
    if (existing) {
      throw new ConflictException(
        `Uma tag com o nome ou slug '${slug}' já existe neste tenant.`,
      );
    }

    const tag = await this.tagRepository.create({
      tenantId,
      name: data.name,
      slug,
      description: data.description || null,
      color: data.color || '#E2E8F0',
      isActive: true,
      createdById: userId,
    });

    this.eventEmitter.emit('audit.log.created', {
      tenantId,
      userId,
      action: 'CREATED',
      entityName: 'TAG',
      entityId: tag.id,
      newValues: tag,
    });

    return tag;
  }
}
