import { Injectable } from '@nestjs/common';
import { PrismaClient, User, Prisma } from '@prisma/client';
import { IUserRepository } from './users.repository.interface';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(tenantId: string, id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { userRoles: true },
    });
  }

  async findByEmail(tenantId: string, email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email, tenantId, deletedAt: null },
    });
  }

  async findAll(
    tenantId: string,
    params: {
      page: number;
      limit: number;
      sort: string;
      direction: 'asc' | 'desc';
      search?: string;
      isActive?: boolean;
    },
  ): Promise<{ data: User[]; total: number }> {
    const where: Prisma.UserWhereInput = {
      tenantId,
      deletedAt: null,
    };

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search } },
        { lastName: { contains: params.search } },
        { email: { contains: params.search } },
      ];
    }

    const skip = (params.page - 1) * params.limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { [params.sort]: params.direction },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total };
  }

  async create(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(
    tenantId: string,
    id: string,
    data: Partial<User>,
  ): Promise<User> {
    const updatedCount = await this.prisma.user.updateMany({
      where: { id, tenantId, deletedAt: null },
      data,
    });

    if (updatedCount.count === 0) {
      throw new Error('User not found or not in this tenant');
    }

    return this.findById(tenantId, id) as Promise<User>;
  }
}
