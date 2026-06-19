import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

import {
  ICustomFieldRepository,
  ICustomFieldValueRepository,
} from './repositories/custom-fields.repository.interface';
import {
  PrismaCustomFieldRepository,
  PrismaCustomFieldValueRepository,
} from './repositories/prisma-custom-fields.repository';

import { CustomFieldsController } from './controllers/custom-fields.controller';
import { CustomFieldValuesController } from './controllers/custom-field-values.controller';

import {
  CreateCustomFieldUseCase,
  UpdateCustomFieldUseCase,
  DeleteCustomFieldUseCase,
  ListCustomFieldsUseCase,
  GetEntityCustomFieldsUseCase,
  SetCustomFieldValuesUseCase,
} from './usecases';

@Module({
  controllers: [CustomFieldsController, CustomFieldValuesController],
  providers: [
    { provide: PrismaClient, useFactory: async () => { const { prisma } = await import('../../lib/prisma'); return prisma; } },
    { provide: ICustomFieldRepository, useClass: PrismaCustomFieldRepository },
    { provide: ICustomFieldValueRepository, useClass: PrismaCustomFieldValueRepository },
    CreateCustomFieldUseCase,
    UpdateCustomFieldUseCase,
    DeleteCustomFieldUseCase,
    ListCustomFieldsUseCase,
    GetEntityCustomFieldsUseCase,
    SetCustomFieldValuesUseCase
  ],
  exports: [ICustomFieldRepository, ICustomFieldValueRepository],
})
export class CustomFieldsModule {}
