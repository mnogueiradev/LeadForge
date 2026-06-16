import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    { provide: PrismaClient, useFactory: () => new PrismaClient({ log: ['error', 'warn'] }) },
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
