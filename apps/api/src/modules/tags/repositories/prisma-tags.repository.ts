import { Injectable } from '@nestjs/common';
import { PrismaClient, Tag, TagAssignment, EntityType } from '@prisma/client';
import {
  ITagRepository,
  ITagAssignmentRepository,
} from './tags.repository.interface';

@Injectable()
export class PrismaTagRepository implements ITagRepository {
  constructor(private prisma: PrismaClient) {}

  async create(
    data: Omit<Tag, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Tag> {
    return this.prisma.tag.create({ data });
  }

  async update(tenantId: string, id: string, data: Partial<Tag>): Promise<Tag> {
    const { tenantId: _, ...updateData } = data as any;
    return this.prisma.tag.update({
      where: { id, tenantId },
      data: updateData,
    });
  }

  async deleteLogical(tenantId: string, id: string): Promise<void> {
    await this.prisma.tag.update({
      where: { id, tenantId },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async findById(tenantId: string, id: string): Promise<Tag | null> {
    return this.prisma.tag.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
  }

  async findBySlug(tenantId: string, slug: string): Promise<Tag | null> {
    return this.prisma.tag.findFirst({
      where: { slug, tenantId, deletedAt: null },
    });
  }

  async findMany(
    tenantId: string,
    includeInactive: boolean = false,
  ): Promise<Tag[]> {
    return this.prisma.tag.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { name: 'asc' },
    });
  }
}

@Injectable()
export class PrismaTagAssignmentRepository implements ITagAssignmentRepository {
  constructor(private prisma: PrismaClient) {}

  async assign(
    data: Omit<TagAssignment, 'id' | 'assignedAt'>,
  ): Promise<TagAssignment> {
    return this.prisma.tagAssignment.create({ data });
  }

  async remove(
    tenantId: string,
    tagId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<void> {
    const contactId = entityType === 'CONTACT' ? entityId : null;
    const organizationId = entityType === 'ORGANIZATION' ? entityId : null;

    await this.prisma.tagAssignment.deleteMany({
      where: {
        tenantId,
        tagId,
        entityType,
        ...(contactId ? { contactId } : {}),
        ...(organizationId ? { organizationId } : {}),
      },
    });
  }

  async findByEntity(
    tenantId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<(TagAssignment & { tag: Tag })[]> {
    const contactId = entityType === 'CONTACT' ? entityId : null;
    const organizationId = entityType === 'ORGANIZATION' ? entityId : null;

    return this.prisma.tagAssignment.findMany({
      where: {
        tenantId,
        entityType,
        ...(contactId ? { contactId } : {}),
        ...(organizationId ? { organizationId } : {}),
        tag: { deletedAt: null },
      },
      include: { tag: true },
    });
  }

  async exists(
    tenantId: string,
    tagId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<boolean> {
    const contactId = entityType === 'CONTACT' ? entityId : null;
    const organizationId = entityType === 'ORGANIZATION' ? entityId : null;

    const count = await this.prisma.tagAssignment.count({
      where: {
        tenantId,
        tagId,
        entityType,
        ...(contactId ? { contactId } : {}),
        ...(organizationId ? { organizationId } : {}),
      },
    });
    return count > 0;
  }
}
