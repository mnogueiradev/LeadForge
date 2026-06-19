import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';

@Module({
  controllers: [DealsController],
  providers: [
    DealsService,
    { provide: PrismaClient, useFactory: async () => { const { prisma } = await import('../../lib/prisma'); return prisma; } },
  ],
  exports: [DealsService],
})
export class DealsModule {}
