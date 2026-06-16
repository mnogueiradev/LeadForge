import { Injectable, Inject } from '@nestjs/common';
import { IInvitationRepository } from '../repositories/invitations.repository.interface';

@Injectable()
export class ListInvitationsUseCase {
  constructor(
    @Inject(IInvitationRepository)
    private invitationRepository: IInvitationRepository,
  ) {}

  async execute(tenantId: string) {
    return this.invitationRepository.findAll(tenantId);
  }
}
