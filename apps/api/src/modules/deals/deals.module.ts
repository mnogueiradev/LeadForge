import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';

@Module({
  controllers: [DealsController],
  providers: [
    DealsService,
    { provide: PrismaClient, useFactory: () => { if (!(globalThis as any).prisma) (globalThis as any).prisma = new PrismaClient({ log: ['error', 'warn'] }); return (globalThis as any).prisma; } },
  ],
  exports: [DealsService],
})
export class DealsModule {}
