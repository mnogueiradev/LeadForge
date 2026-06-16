import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IInvitationRepository } from './repositories/invitations.repository.interface';
import { PrismaInvitationRepository } from './repositories/prisma-invitations.repository';
import { InvitationsController } from './controllers/invitations.controller';
import { PublicInvitationsController } from './controllers/public-invitations.controller';
import { CreateInvitationUseCase } from './usecases/create-invitation.usecase';
import { ResendInvitationUseCase } from './usecases/resend-invitation.usecase';
import { CancelInvitationUseCase } from './usecases/cancel-invitation.usecase';
import { AcceptInvitationUseCase } from './usecases/accept-invitation.usecase';
import { GetInvitationUseCase } from './usecases/get-invitation.usecase';
import { ListInvitationsUseCase } from './usecases/list-invitations.usecase';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [NotificationsModule, UsersModule, RedisModule],
  controllers: [InvitationsController, PublicInvitationsController],
  providers: [
    { provide: PrismaClient, useFactory: () => new PrismaClient({ log: ['error', 'warn'] }) },
    { provide: IInvitationRepository, useClass: PrismaInvitationRepository },
    CreateInvitationUseCase,
    ResendInvitationUseCase,
    CancelInvitationUseCase,
    AcceptInvitationUseCase,
    GetInvitationUseCase,
    ListInvitationsUseCase
  ],
})
export class InvitationsModule {}
