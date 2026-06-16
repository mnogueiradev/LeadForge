import { Module } from '@nestjs/common';
import { SessionsController } from './controllers/sessions.controller';
import { ListSessionsUseCase } from './usecases/list-sessions.usecase';
import { RevokeSessionUseCase } from './usecases/revoke-session.usecase';
import { GlobalLogoutUseCase } from './usecases/global-logout.usecase';
import { PrismaClient } from '@prisma/client';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [SessionsController],
  providers: [
    { provide: PrismaClient, useFactory: () => new PrismaClient({ log: ['error', 'warn'] }) },
    ListSessionsUseCase,
    RevokeSessionUseCase,
    GlobalLogoutUseCase
  ],
  exports: [RevokeSessionUseCase],
})
export class SessionsModule {}
