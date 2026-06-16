import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IInvitationRepository } from '../repositories/invitations.repository.interface';

@Injectable()
export class CancelInvitationUseCase {
  constructor(
    @Inject(IInvitationRepository)
    private invitationRepository: IInvitationRepository,
  ) {}

  async execute(tenantId: string, id: string) {
    const invite = await this.invitationRepository.findById(tenantId, id);
    if (!invite) throw new NotFoundException('Convite não encontrado.');

    if (invite.status === 'ACCEPTED') {
      throw new BadRequestException(
        'Não é possível cancelar um convite já aceito.',
      );
    }

    await this.invitationRepository.updateStatus(id, 'CANCELLED');

    return { success: true };
  }
}
