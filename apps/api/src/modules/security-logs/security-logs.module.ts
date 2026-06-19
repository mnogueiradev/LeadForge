import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SecurityLogsService } from './security-logs.service';
import { SecurityLogsController } from './security-logs.controller';

@Module({
  controllers: [SecurityLogsController],
  providers: [
    { provide: PrismaClient, useFactory: async () => { const { prisma } = await import('../../lib/prisma'); return prisma; } },
    SecurityLogsService
  ],
  exports: [SecurityLogsService],
})
export class SecurityLogsModule {}
