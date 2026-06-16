import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';

@Module({
  controllers: [DealsController],
  providers: [
    DealsService,
    { provide: PrismaClient, useFactory: () => new PrismaClient({ log: ['error', 'warn'] }) },
  ],
  exports: [DealsService],
})
export class DealsModule {}
