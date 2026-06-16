import { Injectable } from '@nestjs/common';
import { PrismaClient, Permission } from '@prisma/client';
import { IPermissionRepository } from './permissions.repository.interface';

@Injectable()
export class PrismaPermissionRepository implements IPermissionRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findByNames(names: string[]): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      where: { name: { in: names } },
    });
  }
}
