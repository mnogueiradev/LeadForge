import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IOrganizationRepository } from '../repositories/organizations.repository.interface';
import { Organization } from '@prisma/client';

@Injectable()
export class GetOrganizationUseCase {
  constructor(
    @Inject(IOrganizationRepository)
    private repository: IOrganizationRepository,
  ) {}

  async execute(tenantId: string, id: string): Promise<Organization> {
    const org = await this.repository.findById(tenantId, id);
    if (!org) {
      throw new NotFoundException('Organização não encontrada.');
    }
    return org;
  }
}
