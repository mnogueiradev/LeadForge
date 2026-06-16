import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IInvitationRepository } from '../repositories/invitations.repository.interface';

@Injectable()
export class GetInvitationUseCase {
  constructor(
    @Inject(IInvitationRepository)
    private invitationRepository: IInvitationRepository,
  ) {}

  async execute(token: string) {
    const invite = await this.invitationRepository.findByToken(token);
    if (!invite)
      throw new NotFoundException('Convite inválido ou não encontrado.');

    // Remove sensitive info before returning public data
    return {
      id: invite.id,
      email: invite.email,
      status: invite.status,
      expiresAt: invite.expiresAt,
      tenant: {
        name: invite.tenant?.name,
      },
      role: {
        name: invite.role?.name,
      },
    };
  }
}
