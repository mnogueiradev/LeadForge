import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RolesController } from './controllers/roles.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { IRoleRepository } from './repositories/roles.repository.interface';
import { PrismaRoleRepository } from './repositories/prisma-roles.repository';
import { IPermissionRepository } from './repositories/permissions.repository.interface';
import { PrismaPermissionRepository } from './repositories/prisma-permissions.repository';

// Use Cases
import { CreateRoleUseCase } from './usecases/create-role.usecase';
import { UpdateRoleUseCase } from './usecases/update-role.usecase';
import { DeleteRoleUseCase } from './usecases/delete-role.usecase';
import { ListRolesUseCase } from './usecases/list-roles.usecase';
import { GetRoleUseCase } from './usecases/get-role.usecase';
import { AssignPermissionUseCase } from './usecases/assign-permission.usecase';
import { RemovePermissionUseCase } from './usecases/remove-permission.usecase';
import { AssignRoleUseCase } from './usecases/assign-role.usecase';
import { RemoveRoleUseCase } from './usecases/remove-role.usecase';
import { ListPermissionsUseCase } from './usecases/list-permissions.usecase';

import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [RolesController, PermissionsController],
  providers: [
    { provide: PrismaClient, useFactory: () => new PrismaClient({ log: ['error', 'warn'] }) },
    { provide: IRoleRepository, useClass: PrismaRoleRepository },
    { provide: IPermissionRepository, useClass: PrismaPermissionRepository },
    CreateRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    ListRolesUseCase,
    GetRoleUseCase,
    AssignPermissionUseCase,
    RemovePermissionUseCase,
    AssignRoleUseCase,
    RemoveRoleUseCase,
    ListPermissionsUseCase
  ],
  exports: [IRoleRepository],
})
export class RbacModule {}
