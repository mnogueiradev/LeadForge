import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UsersController } from './controllers/users.controller';
import { IUserRepository } from './repositories/users.repository.interface';
import { PrismaUserRepository } from './repositories/prisma-users.repository';
import { CreateUserUseCase } from './usecases/create-user.usecase';
import { UpdateUserUseCase } from './usecases/update-user.usecase';
import { GetUserUseCase } from './usecases/get-user.usecase';
import { ListUsersUseCase } from './usecases/list-users.usecase';
import { DeactivateUserUseCase } from './usecases/deactivate-user.usecase';
import { ActivateUserUseCase } from './usecases/activate-user.usecase';
import { UpdateProfileUseCase } from './usecases/update-profile.usecase';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [UsersController],
  providers: [
    { provide: PrismaClient, useFactory: () => { if (!(globalThis as any).prisma) (globalThis as any).prisma = new PrismaClient({ log: ['error', 'warn'] }); return (globalThis as any).prisma; } },
    { provide: IUserRepository, useClass: PrismaUserRepository },
    CreateUserUseCase,
    UpdateUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,
    DeactivateUserUseCase,
    ActivateUserUseCase,
    UpdateProfileUseCase
  ],
  exports: [IUserRepository],
})
export class UsersModule {}
