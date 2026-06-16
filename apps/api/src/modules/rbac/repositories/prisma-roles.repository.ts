import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import { IRoleRepository } from './roles.repository.interface';

@Injectable()
export class PrismaRoleRepository implements IRoleRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(tenantId: string, id: string): Promise<Role | null> {
    return this.prisma.role.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        permissions: { include: { permission: true } },
      },
    });
  }

  async findByName(tenantId: string, name: string): Promise<Role | null> {
    return this.prisma.role.findFirst({
      where: { name, tenantId, deletedAt: null },
    });
  }

  async findAll(tenantId: string): Promise<Role[]> {
    return this.prisma.role.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        _count: { select: { userRoles: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    tenantId: string,
    data: { name: string; isSystem?: boolean; permissionIds?: string[] },
  ): Promise<Role> {
    return this.prisma.role.create({
      data: {
        tenantId,
        name: data.name,
        isSystem: data.isSystem || false,
        permissions: data.permissionIds
          ? {
              create: data.permissionIds.map((id) => ({ permissionId: id })),
            }
          : undefined,
      },
    });
  }

  async update(
    tenantId: string,
    id: string,
    data: { name?: string },
  ): Promise<Role> {
    const role = await this.prisma.role.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem)
      throw new ForbiddenException('Cannot rename a system role');

    return this.prisma.role.update({
      where: { id },
      data: { name: data.name },
    });
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const role = await this.prisma.role.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!role) return false;
    if (role.isSystem)
      throw new ForbiddenException('Cannot delete a system role');

    // Soft delete
    await this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }

  async assignPermissions(
    tenantId: string,
    roleId: string,
    permissionIds: string[],
  ): Promise<void> {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, tenantId, deletedAt: null },
    });
    if (!role) throw new NotFoundException('Role not found');

    const creates = permissionIds.map((pid) => ({ roleId, permissionId: pid }));
    await this.prisma.rolePermission.createMany({
      data: creates,
      skipDuplicates: true,
    });
  }

  async removePermissions(
    tenantId: string,
    roleId: string,
    permissionIds: string[],
  ): Promise<void> {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, tenantId, deletedAt: null },
    });
    if (!role) throw new NotFoundException('Role not found');

    await this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: { in: permissionIds },
      },
    });
  }

  async assignRoleToUser(
    tenantId: string,
    userId: string,
    roleId: string,
  ): Promise<void> {
    // Validate user belongs to tenant
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
    });
    if (!user) throw new NotFoundException('User not found in tenant');

    // Validate role belongs to tenant
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, tenantId, deletedAt: null },
    });
    if (!role) throw new NotFoundException('Role not found in tenant');

    await this.prisma.userRole
      .create({
        data: { userId, roleId },
      })
      .catch(() => {}); // ignore unique constraint if already exists
  }

  async removeRoleFromUser(
    tenantId: string,
    userId: string,
    roleId: string,
  ): Promise<void> {
    await this.prisma.userRole.deleteMany({
      where: { userId, roleId }, // Prisma will just delete if exists
    });
  }

  async getUserEffectivePermissions(
    tenantId: string,
    userId: string,
  ): Promise<string[]> {
    // Check if user is in tenant
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
    });
    if (!user) return [];

    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const perms = new Set<string>();
    for (const ur of userRoles) {
      if (!ur.role.deletedAt) {
        for (const rp of ur.role.permissions) {
          perms.add(rp.permission.name);
        }
      }
    }

    return Array.from(perms);
  }
}
