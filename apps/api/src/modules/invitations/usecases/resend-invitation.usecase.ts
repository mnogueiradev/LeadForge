import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { IInvitationRepository } from '../repositories/invitations.repository.interface';
import { INotificationProvider } from '../../notifications/providers/notification.provider.interface';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ResendInvitationUseCase {
  constructor(
    @Inject(IInvitationRepository)
    private invitationRepository: IInvitationRepository,
    @Inject(INotificationProvider)
    private notificationProvider: INotificationProvider,
    private prisma: PrismaClient,
  ) {}

  async execute(tenantId: string, id: string, invitedById: string) {
    const invite = await this.invitationRepository.findById(tenantId, id);
    if (!invite) throw new NotFoundException('Convite não encontrado.');

    if (invite.status === 'ACCEPTED') {
      throw new BadRequestException('Este convite já foi aceito.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.invitationRepository.updateTokenAndExpiry(id, token, expiresAt);

    // Update inviter to whoever is resending
    await this.prisma.invitation.update({
      where: { id },
      data: { invitedById },
    });

    const [tenant, inviter] = await Promise.all([
      this.prisma.tenant.findUnique({ where: { id: tenantId } }),
      this.prisma.user.findUnique({ where: { id: invitedById } }),
    ]);

    const inviteUrl = `${process.env.APP_URL || 'http://localhost:3000'}/invite/${token}`;

    await this.notificationProvider.sendInvitationEmail(
      invite.email,
      inviteUrl,
      `${inviter?.firstName} ${inviter?.lastName}`,
      tenant?.name || 'sua organização',
    );

    return { success: true };
  }
}
