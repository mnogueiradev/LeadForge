import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Note, EntityType } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import {
  INoteRepository,
  CreateNoteData,
  UpdateNoteData,
} from './notes.repository.interface';

@Injectable()
export class PrismaNoteRepository implements INoteRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly cls: ClsService,
  ) {}

  async create(
    tenantId: string,
    authorId: string,
    data: CreateNoteData,
  ): Promise<Note> {
    const { entityType, entityId, ...rest } = data;

    const connectData: any = {};
    if (entityType === 'CONTACT') {
      connectData.contact = { connect: { id: entityId } };
    } else if (entityType === 'ORGANIZATION') {
      connectData.organization = { connect: { id: entityId } };
    }

    return this.prisma.note.create({
      data: {
        tenantId,
        authorUserId: authorId,
        entityType,
        ...connectData,
        ...rest,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async update(
    tenantId: string,
    id: string,
    data: UpdateNoteData,
  ): Promise<Note> {
    const note = await this.findById(tenantId, id);
    if (!note) throw new NotFoundException('Note not found');

    return this.prisma.note.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const note = await this.findById(tenantId, id);
    if (!note) throw new NotFoundException('Note not found');

    await this.prisma.note.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findById(tenantId: string, id: string): Promise<Note | null> {
    return this.prisma.note.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findByEntity(
    tenantId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<Note[]> {
    const whereData: any = {
      tenantId,
      entityType,
      deletedAt: null,
    };

    if (entityType === 'CONTACT') {
      whereData.contactId = entityId;
    } else if (entityType === 'ORGANIZATION') {
      whereData.organizationId = entityId;
    }

    return this.prisma.note.findMany({
      where: whereData,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async togglePin(
    tenantId: string,
    id: string,
    isPinned: boolean,
  ): Promise<Note> {
    const note = await this.findById(tenantId, id);
    if (!note) throw new NotFoundException('Note not found');

    return this.prisma.note.update({
      where: { id },
      data: { isPinned },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }
}
