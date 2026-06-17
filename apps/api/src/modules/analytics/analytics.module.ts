import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    { provide: PrismaClient, useFactory: () => { if (!(globalThis as any).prisma) (globalThis as any).prisma = new PrismaClient({ log: ['error', 'warn'] }); return (globalThis as any).prisma; } },
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
