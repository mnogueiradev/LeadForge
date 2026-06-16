import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ILeadRepository } from '../repositories/leads.repository.interface';
import { LEAD_REPOSITORY } from '../repositories/leads.repository.interface';

@Injectable()
export class ArchiveLeadUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY)
    private readonly leadRepository: ILeadRepository,
  ) {}

  async execute(tenantId: string, leadId: string) {
    const existing = await this.leadRepository.findById(leadId, tenantId);
    if (!existing) {
      throw new NotFoundException('Lead not found');
    }

    return this.leadRepository.update(leadId, tenantId, {
      deletedAt: new Date(),
    });
  }
}
