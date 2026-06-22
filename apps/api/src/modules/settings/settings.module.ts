import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [SettingsController],
  providers: [
    SettingsService,
    {
      provide: PrismaClient,
      useFactory: async () => {
        const { prisma } = await import('../../lib/prisma');
        return prisma;
      },
    },
  ],
  exports: [SettingsService],
})
export class SettingsModule {}
