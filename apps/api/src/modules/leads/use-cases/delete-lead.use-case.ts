import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ILeadRepository } from '../repositories/leads.repository.interface';
import { LEAD_REPOSITORY } from '../repositories/leads.repository.interface';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DeleteLeadUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY)
    private readonly leadRepository: ILeadRepository,
    private readonly prisma: PrismaClient, // Injeção direta se precisar hard delete ou transaction, ou implementa no repository
  ) {}

  async execute(tenantId: string, leadId: string) {
    const existing = await this.leadRepository.findById(leadId, tenantId);
    if (!existing) {
      throw new NotFoundException('Lead not found');
    }

    // Hard delete via Prisma
    await this.prisma.lead.delete({
      where: { id: leadId }, // id é único
    });
  }
}
