import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

@Module({
  controllers: [AuditController],
  providers: [
    { provide: PrismaClient, useFactory: () => { if (!(globalThis as any).prisma) (globalThis as any).prisma = new PrismaClient({ log: ['error', 'warn'] }); return (globalThis as any).prisma; } },
    AuditService
  ],
  exports: [AuditService],
})
export class AuditModule {}
