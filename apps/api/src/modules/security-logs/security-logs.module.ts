import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SecurityLogsService } from './security-logs.service';
import { SecurityLogsController } from './security-logs.controller';

@Module({
  controllers: [SecurityLogsController],
  providers: [
    { provide: PrismaClient, useFactory: () => { if (!(globalThis as any).prisma) (globalThis as any).prisma = new PrismaClient({ log: ['error', 'warn'] }); return (globalThis as any).prisma; } },
    SecurityLogsService
  ],
  exports: [SecurityLogsService],
})
export class SecurityLogsModule {}
