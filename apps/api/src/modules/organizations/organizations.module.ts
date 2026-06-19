import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IOrganizationRepository } from './repositories/organizations.repository.interface';
import { PrismaOrganizationRepository } from './repositories/prisma-organizations.repository';
import { OrganizationsController } from './controllers/organizations.controller';
import { CreateOrganizationUseCase } from './usecases/create-organization.usecase';
import { UpdateOrganizationUseCase } from './usecases/update-organization.usecase';
import { ArchiveOrganizationUseCase } from './usecases/archive-organization.usecase';
import { DeleteOrganizationUseCase } from './usecases/delete-organization.usecase';
import { GetOrganizationUseCase } from './usecases/get-organization.usecase';
import { ListOrganizationsUseCase } from './usecases/list-organizations.usecase';
import { ChangeOrganizationOwnerUseCase } from './usecases/change-owner.usecase';

@Module({
  controllers: [OrganizationsController],
  providers: [
    { provide: PrismaClient, useFactory: async () => { const { prisma } = await import('../../lib/prisma'); return prisma; } },
    { provide: IOrganizationRepository, useClass: PrismaOrganizationRepository },
    CreateOrganizationUseCase,
    UpdateOrganizationUseCase,
    ArchiveOrganizationUseCase,
    DeleteOrganizationUseCase,
    GetOrganizationUseCase,
    ListOrganizationsUseCase,
    ChangeOrganizationOwnerUseCase
  ],
  exports: [IOrganizationRepository],
})
export class OrganizationsModule {}
