import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    { provide: PrismaClient, useFactory: async () => { const { prisma } = await import('../../lib/prisma'); return prisma; } },
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
