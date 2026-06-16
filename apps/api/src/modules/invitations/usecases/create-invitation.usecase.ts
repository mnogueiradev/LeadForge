import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { IInvitationRepository } from '../repositories/invitations.repository.interface';
import { INotificationProvider } from '../../notifications/providers/notification.provider.interface';
import { IUserRepository } from '../../users/repositories/users.repository.interface';
import { PrismaClient } from '@prisma/client';
import { SecurityPolicyService } from '../../security-policies/services/security-policy.service';

@Injectable()
export class CreateInvitationUseCase {
  constructor(
    @Inject(IInvitationRepository)
    private invitationRepository: IInvitationRepository,
    @Inject(IUserRepository) private userRepository: IUserRepository,
    @Inject(INotificationProvider)
    private notificationProvider: INotificationProvider,
    private prisma: PrismaClient,
    private securityPolicyService: SecurityPolicyService,
  ) {}

  async execute(
    tenantId: string,
    invitedById: string,
    data: { email: string; roleId: string },
  ) {
    const existingUser = await this.userRepository.findByEmail(
      tenantId,
      data.email,
    );
    if (existingUser) {
      throw new BadRequestException('Usuário já faz parte da organização.');
    }

    // --- ENFORCEMENT: Invitation & Access Policy ---
    const policy = await this.securityPolicyService.getPolicy(tenantId);

    if (policy.accessPolicy.allowedDomains.length > 0) {
      const emailDomain = data.email.split('@')[1];
      if (!policy.accessPolicy.allowedDomains.includes(emailDomain)) {
        throw new ForbiddenException(
          `O domínio @${emailDomain} não é permitido pelas políticas de segurança desta organização.`,
        );
      }
    }

    // Check if there is already a pending invitation
    const existingInvite = await this.invitationRepository.findByEmail(
      tenantId,
      data.email,
    );
    if (
      existingInvite &&
      existingInvite.status === 'PENDING' &&
      existingInvite.expiresAt > new Date()
    ) {
      throw new BadRequestException(
        'Já existe um convite pendente para este e-mail.',
      );
    }

    // Validate role
    const role = await this.prisma.role.findFirst({
      where: { id: data.roleId, tenantId, deletedAt: null },
    });
    if (!role) {
      throw new BadRequestException('Perfil de acesso inválido.');
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() + policy.invitationPolicy.invitationExpirationHours,
    );

    // Check if we need to update an existing expired/cancelled invite or create a new one
    let invite;
    if (existingInvite) {
      await this.invitationRepository.updateTokenAndExpiry(
        existingInvite.id,
        token,
        expiresAt,
      );
      // Update role if changed
      await this.prisma.invitation.update({
        where: { id: existingInvite.id },
        data: { roleId: data.roleId, invitedById },
      });
      invite = await this.invitationRepository.findById(
        tenantId,
        existingInvite.id,
      );
    } else {
      invite = await this.invitationRepository.create({
        tenantId,
        email: data.email,
        roleId: data.roleId,
        invitedById,
        token,
        expiresAt,
      });
    }

    // Get Tenant and Inviter details for email
    const [tenant, inviter] = await Promise.all([
      this.prisma.tenant.findUnique({ where: { id: tenantId } }),
      this.prisma.user.findUnique({ where: { id: invitedById } }),
    ]);

    const inviteUrl = `${process.env.APP_URL || 'http://localhost:3000'}/invite/${token}`;

    await this.notificationProvider.sendInvitationEmail(
      data.email,
      inviteUrl,
      `${inviter?.firstName} ${inviter?.lastName}`,
      tenant?.name || 'sua organização',
    );

    return invite;
  }
}
