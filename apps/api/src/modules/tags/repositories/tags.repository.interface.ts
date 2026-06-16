import { Tag, TagAssignment, EntityType } from '@prisma/client';

export const ITagRepository = Symbol('ITagRepository');
export const ITagAssignmentRepository = Symbol('ITagAssignmentRepository');

export interface ITagRepository {
  create(
    data: Omit<Tag, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Tag>;
  update(tenantId: string, id: string, data: Partial<Tag>): Promise<Tag>;
  deleteLogical(tenantId: string, id: string): Promise<void>;
  findById(tenantId: string, id: string): Promise<Tag | null>;
  findBySlug(tenantId: string, slug: string): Promise<Tag | null>;
  findMany(tenantId: string, includeInactive?: boolean): Promise<Tag[]>;
}

export interface ITagAssignmentRepository {
  assign(
    data: Omit<TagAssignment, 'id' | 'assignedAt'>,
  ): Promise<TagAssignment>;
  remove(
    tenantId: string,
    tagId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<void>;
  findByEntity(
    tenantId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<(TagAssignment & { tag: Tag })[]>;
  exists(
    tenantId: string,
    tagId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<boolean>;
}
