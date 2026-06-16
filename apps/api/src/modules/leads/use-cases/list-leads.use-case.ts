import { Injectable, Inject } from '@nestjs/common';
import type {
  ILeadRepository,
  ListLeadsParams,
} from '../repositories/leads.repository.interface';
import { LEAD_REPOSITORY } from '../repositories/leads.repository.interface';

@Injectable()
export class ListLeadsUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY)
    private readonly leadRepository: ILeadRepository,
  ) {}

  async execute(tenantId: string, params: ListLeadsParams) {
    return this.leadRepository.findAll(tenantId, params);
  }
}
