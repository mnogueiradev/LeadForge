import { Module } from '@nestjs/common';
import { DealMovedListener } from './listeners/deal-moved.listener';
import { StagnantDealsCron } from './cron/stagnant-deals.cron';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [
    DealMovedListener, 
    StagnantDealsCron,
    { provide: PrismaClient, useFactory: async () => { const { prisma } = await import('../../lib/prisma'); return prisma; } },
  ],
})
export class AutomationsModule {}
