import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LeadsController } from './leads.controller';
import { LEAD_REPOSITORY } from './repositories/leads.repository.interface';
import { PrismaLeadRepository } from './repositories/prisma-leads.repository';
import {
  CreateLeadUseCase,
  UpdateLeadUseCase,
  ConvertLeadUseCase,
  LoseLeadUseCase,
  ListLeadsUseCase,
  ArchiveLeadUseCase,
  DeleteLeadUseCase,
  GetLeadUseCase,
} from './use-cases';

@Module({
  controllers: [LeadsController],
  providers: [
    { provide: PrismaClient, useFactory: () => { if (!(globalThis as any).prisma) (globalThis as any).prisma = new PrismaClient({ log: ['error', 'warn'] }); return (globalThis as any).prisma; } },
    { provide: LEAD_REPOSITORY, useClass: PrismaLeadRepository },
    CreateLeadUseCase,
    UpdateLeadUseCase,
    ConvertLeadUseCase,
    LoseLeadUseCase,
    ListLeadsUseCase,
    ArchiveLeadUseCase,
    DeleteLeadUseCase,
    GetLeadUseCase,
  ],
  exports: [LEAD_REPOSITORY],
})
export class LeadsModule {}
