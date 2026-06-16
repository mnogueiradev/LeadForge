import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma, Pipeline } from '@prisma/client';
import type { IPipelineRepository } from './pipelines.repository.interface';

@Injectable()
export class PrismaPipelineRepository implements IPipelineRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    tenantId: string,
    data: Omit<
      Pipeline,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'tenantId'
    >,
  ): Promise<Pipeline> {
    return this.prisma.pipeline.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async findById(tenantId: string, id: string): Promise<Pipeline | null> {
    return this.prisma.pipeline.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
    });
  }

  async update(
    tenantId: string,
    id: string,
    data: Partial<Pipeline>,
  ): Promise<Pipeline> {
    await this.prisma.pipeline.updateMany({
      where: { id, tenantId },
      data,
    });
    return this.findById(tenantId, id) as Promise<Pipeline>;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.prisma.pipeline.deleteMany({
      where: { id, tenantId },
    });
  }

  async archive(tenantId: string, id: string): Promise<Pipeline> {
    await this.prisma.pipeline.updateMany({
      where: { id, tenantId },
      data: { deletedAt: new Date() },
    });
    return this.prisma.pipeline.findFirstOrThrow({ where: { id, tenantId } });
  }

  async findAll(
    tenantId: string,
    params: {
      skip?: number;
      take?: number;
      includeArchived?: boolean;
      isActive?: boolean;
      search?: string;
    },
  ): Promise<[Pipeline[], number]> {
    const where: Prisma.PipelineWhereInput = {
      tenantId,
      deletedAt: params.includeArchived ? undefined : null,
    };

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    if (params.search) {
      where.name = { contains: params.search }; // case-insensitive se collation permitir
    }

    const [items, total] = await Promise.all([
      this.prisma.pipeline.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { displayOrder: 'asc' },
      }),
      this.prisma.pipeline.count({ where }),
    ]);

    return [items, total];
  }

  async findDefault(tenantId: string): Promise<Pipeline | null> {
    return this.prisma.pipeline.findFirst({
      where: { tenantId, isDefault: true, deletedAt: null },
    });
  }

  async unsetDefaultForTenant(tenantId: string): Promise<void> {
    await this.prisma.pipeline.updateMany({
      where: { tenantId, isDefault: true },
      data: { isDefault: false },
    });
  }

  async updateDisplayOrder(
    tenantId: string,
    id: string,
    order: number,
  ): Promise<void> {
    await this.prisma.pipeline.updateMany({
      where: { id, tenantId },
      data: { displayOrder: order },
    });
  }
}
