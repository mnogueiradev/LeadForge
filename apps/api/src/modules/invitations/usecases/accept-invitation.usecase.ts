import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IInvitationRepository } from '../repositories/invitations.repository.interface';
import { IUserRepository } from '../../users/repositories/users.repository.interface';
import { PrismaClient } from '@prisma/client';
import { AcceptInvitationDto } from '../dtos/accept-invitation.dto';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../../redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SecurityLogSeverity } from '@prisma/client';

@Injectable()
export class AcceptInvitationUseCase {
  constructor(
    @Inject(IInvitationRepository)
    private invitationRepository: IInvitationRepository,
    @Inject(IUserRepository) private userRepository: IUserRepository,
    private prisma: PrismaClient,
    private redisService: RedisService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(token: string, data: AcceptInvitationDto) {
    const invite = await this.invitationRepository.findByToken(token);
    if (!invite)
      throw new NotFoundException('Convite inválido ou não encontrado.');

    if (invite.status === 'ACCEPTED')
      throw new BadRequestException('Este convite já foi aceito.');
    if (invite.status === 'CANCELLED')
      throw new BadRequestException('Este convite foi cancelado.');
    if (invite.expiresAt < new Date())
      throw new BadRequestException('Este convite expirou.');

    // Check if user already exists in tenant
    let user = await this.userRepository.findByEmail(
      invite.tenantId,
      invite.email,
    );

    // Hash new password
    const passwordHash = await bcrypt.hash(data.password, 10);

    if (user) {
      if (user.isActive) {
        throw new BadRequestException('Você já é membro desta organização.');
      }

      // Reactivate user and update info
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          passwordHash,
          phone: data.phone,
          jobTitle: data.jobTitle,
          isActive: true,
          deletedAt: null,
        },
      });

      // Assign the new role (append)
      await this.prisma.userRole
        .create({
          data: { userId: user.id, roleId: invite.roleId },
        })
        .catch(() => {}); // ignore unique constraint
    } else {
      // Create new user for this tenant
      user = await this.prisma.user.create({
        data: {
          tenantId: invite.tenantId,
          email: invite.email,
          firstName: data.firstName,
          lastName: data.lastName,
          passwordHash,
          phone: data.phone,
          jobTitle: data.jobTitle,
          isActive: true,
          userRoles: {
            create: [{ roleId: invite.roleId }],
          },
        },
      });
    }

    // Mark invite as accepted
    await this.invitationRepository.markAsAccepted(invite.id);

    // Emit Events
    this.eventEmitter.emit('audit.invitation.accepted', {
      tenantId: invite.tenantId,
      userId: user.id,
      action: 'ACCEPTED',
      entityName: 'Invitation',
      entityId: invite.id,
    });

    this.eventEmitter.emit('security.invitation.accepted', {
      tenantId: invite.tenantId,
      userId: user.id,
      eventType: 'INVITATION',
      action: 'INVITATION_ACCEPTED',
      severity: SecurityLogSeverity.INFO,
    });

    // Invalidate user cache just in case
    await this.redisService.invalidateUserPermissions(invite.tenantId, user.id);

    return { success: true, message: 'Conta ativada com sucesso.' };
  }
}
